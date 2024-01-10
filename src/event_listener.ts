import StatusBar from "./status_bar";
import {DocumentChanges} from "./render_plugin/document_changes_listener";
import {cancelSuggestion, insertSuggestion, updateSuggestion} from "./render_plugin/states";
import {EditorView} from "@codemirror/view";
import State from "./states/state";
import {EventHandler} from "./states/types";
import InitState from "./states/init_state";
import IdleState from "./states/idle_state";
import SuggestingState from "./states/suggesting_state";
import {PredictionService} from "./prediction_services/types";
import ChatGPTWithReasoning from "./prediction_services/chat_gpt_with_reasoning";
import {checkForErrors} from "./settings/utils";
import Context from "./context_detection";
import {Settings} from "./settings/versions";
import {SettingsObserver} from "./settings/SettingsTab";
import {isMatchBetweenPathAndPatterns} from "./utils";
import DisabledManualState from "./states/disabled_manual_state";
import DisabledFileSpecificState from "./states/disabled_file_specific_state";
import {LRUCache} from "lru-cache";
import DisabledInvalidSettingsState from "./states/disabled_invalid_settings_state";


const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const MAX_N_ITEMS_IN_CACHE = 5000;
const PRECENTAGE_OF_TO_KEEP_IN_CACHE = 0.25;

class EventListener implements EventHandler, SettingsObserver {
    private view: EditorView | null = null;

    private state: EventHandler = new InitState();
    private statusBar: StatusBar;
    context: Context = Context.Text;
    predictionService: PredictionService;
    settings: Settings;
    private currentFilePath: string | null = null;
    private suggestionCache = new LRUCache<string, string>({max: MAX_N_ITEMS_IN_CACHE, ttl: FIVE_MINUTES_IN_MS});

    public static fromSettings(
        settings: Settings,
        statusBar: StatusBar
    ): EventListener {
        const predictionService = createPredictionService(settings);

        const eventListener = new EventListener(
            settings,
            statusBar,
            predictionService
        );

        const settingErrors = checkForErrors(settings);
        if (settings.enabled) {
            eventListener.transitionTo(new IdleState(eventListener));
        } else if (settingErrors.size > 0) {
            eventListener.transitionTo(new DisabledInvalidSettingsState(eventListener));
        } else if (!settings.enabled) {
            eventListener.transitionTo(new DisabledManualState(eventListener));
        }

        return eventListener;
    }

    private constructor(
        settings: Settings,
        statusBar: StatusBar,
        predictionService: PredictionService
    ) {
        this.settings = settings;
        this.statusBar = statusBar;
        this.predictionService = predictionService;
    }

    public setContext(context: Context): void {
        if (context === this.context) {
            return;
        }
        this.context = context;
        this.updateStatusBarText();
    }

    public isSuggesting(): boolean {
        return this.state instanceof SuggestingState;
    }

    public onViewUpdate(view: EditorView): void {
        this.view = view;
    }

    public handleFilePathChange(path: string): void {
        this.currentFilePath = path;
        this.state.handleFilePathChange(path);

    }

    public isCurrentFilePathIgnored(): boolean {
        if (this.currentFilePath === null) {
            return false;
        }
        const patterns = this.settings.ignoredFilePatterns.split("\n");
        return isMatchBetweenPathAndPatterns(this.currentFilePath, patterns);
    }

    insertCurrentSuggestion(suggestion: string): void {
        if (this.view === null) {
            return;
        }
        insertSuggestion(this.view, suggestion);
    }

    cancelSuggestion(): void {
        if (this.view === null) {
            return;
        }
        cancelSuggestion(this.view);
    }

    transitionTo(state: State): void {
        this.state = state;
        this.updateStatusBarText();
    }

    transitionToDisabledFileSpecificState(): void {
        this.transitionTo(new DisabledFileSpecificState(this));
    }

    transitionToDisabledManualState(): void {
        this.cancelSuggestion();
        this.transitionTo(new DisabledManualState(this));
    }

    transitionToDisabledInvalidSettingsState(): void {
        this.cancelSuggestion();
        this.transitionTo(new DisabledInvalidSettingsState(this));
    }

    transitionToSuggestingState(
        suggestion: string,
        prefix: string,
        suffix: string,
    ): void {
        if (this.view === null) {
            return;
        }
        if (suggestion.trim().length === 0) {
            this.transitionTo(new IdleState(this));
            return;
        }

        this.addSuggestionToCache(prefix, suffix, suggestion);
        this.transitionTo(new SuggestingState(this, suggestion, prefix, suffix));
        updateSuggestion(this.view, suggestion);
    }
    public transitionToIdleState() {
        if (this.state instanceof SuggestingState) {
            this.cancelSuggestion();
        }
        this.transitionTo(new IdleState(this));
    }


    private updateStatusBarText(): void {
        this.statusBar.updateText(this.getStatusBarText());
    }

    getStatusBarText(): string {
        return `Copilot: ${this.state.getStatusBarText()}`;
    }

    handleSettingChanged(settings: Settings): void {
        this.settings = settings;
        this.predictionService = createPredictionService(settings);
        if (!this.settings.cacheSuggestions) {
            this.clearSuggestionsCache();
        }

        this.state.handleSettingChanged(settings);
    }

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        await this.state.handleDocumentChange(documentChanges);
    }

    handleAcceptKeyPressed(): boolean {
        return this.state.handleAcceptKeyPressed();
    }

    handlePartialAcceptKeyPressed(): boolean {
        return this.state.handlePartialAcceptKeyPressed();
    }

    handleCancelKeyPressed(): boolean {
        return this.state.handleCancelKeyPressed();
    }

    handlePredictCommand(prefix: string, suffix: string): void {
        this.state.handlePredictCommand(prefix, suffix);
    }

    handleAcceptCommand(): void {
        this.state.handleAcceptCommand();
    }

    containsTriggerCharacters(
        documentChanges: DocumentChanges
    ): boolean {
        for (const trigger of this.settings.triggers) {
            if (trigger.type === "string" && documentChanges.getPrefix().endsWith(trigger.value)) {
                return true;
            }
            if (trigger.type === "regex" && documentChanges.getPrefix().match(trigger.value)) {
                return true;
            }
        }
        return false;
    }

    public isDisabled(): boolean {
        return this.state instanceof DisabledManualState || this.state instanceof DisabledInvalidSettingsState || this.state instanceof DisabledFileSpecificState;
    }

    public isIdle(): boolean {
        return this.state instanceof IdleState;
    }

    public hasCachedSuggestionsFor(prefix: string, suffix: string): boolean {
        return this.suggestionCache.has(this.getCacheKey(prefix, suffix));
    }

    public getCachedSuggestionFor(prefix: string, suffix: string): string | undefined {
        return this.suggestionCache.get(this.getCacheKey(prefix, suffix));
    }

    private getCacheKey(prefix: string, suffix: string): string {
        const nCharsToKeepPrefix = Math.floor(prefix.length * PRECENTAGE_OF_TO_KEEP_IN_CACHE);
        const nCharsToKeepSuffix = Math.floor(suffix.length * PRECENTAGE_OF_TO_KEEP_IN_CACHE);

        return `${prefix.substring(prefix.length - nCharsToKeepPrefix)}<mask/>${suffix.substring(0, nCharsToKeepSuffix)}`
    }

    public clearSuggestionsCache(): void {
        this.suggestionCache.clear();
    }
    
    public addSuggestionToCache(prefix: string, suffix: string, suggestions: string): void {
        if (!this.settings.cacheSuggestions) {
            return;
        }
        this.suggestionCache.set(this.getCacheKey(prefix, suffix), suggestions);
    }
}

function createPredictionService(settings: Settings) {
    return ChatGPTWithReasoning.fromSettings(settings);
}

export default EventListener;
