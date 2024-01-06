import StatusBar from "./status_bar";
import {DocumentChanges} from "./render_plugin/document_changes_listener";
import {cancelSuggestion, insertSuggestion, updateSuggestion,} from "./render_plugin/states";
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
import DisabledInvalidSettingsState from "./states/disabled_invalid_settings_state";
import DisabledFileSpecificState from "./states/disabled_file_specific_state";
import {LRUCache} from "lru-cache";


const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const MAX_N_ITEMS_IN_CACHE = 5000;

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
        this.transitionTo(new DisabledManualState(this));
    }

    transitionToDisabledInvalidSettingsState(): void {
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

        this.suggestionCache.set(JSON.stringify({prefix, suffix}), suggestion);
        updateSuggestion(this.view, suggestion);
        this.transitionTo(new SuggestingState(this, suggestion, prefix, suffix));
    }


    private updateStatusBarText(): void {
        this.statusBar.updateText(this.getStatusBarText());
    }

    getStatusBarText(): string {
        return `Copilot: ${this.state.getStatusBarText()}`;
    }

    handleSettingChanged(settings: Settings): void {
        this.settings = settings;
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
        return this.suggestionCache.has(JSON.stringify({prefix, suffix}));
    }

    public getCachedSuggestionFor(prefix: string, suffix: string): string | undefined {
        return this.suggestionCache.get(JSON.stringify({prefix, suffix}));
    }

    public removeCachedSuggestionFor(prefix: string, suffix: string): void {
        this.suggestionCache.delete(JSON.stringify({prefix, suffix}));
    }

    public clearSuggestionsCache(): void {
        this.suggestionCache.clear();
    }

    public fillSuggestionCache(prefix: string, suffix: string, suggestion: string): void {
        // We do this in reverse since the cache is a LRU cache.
        // We prefer to keep the start of the suggestion in the cache over the end.
        for (let i = suggestion.length - 1; i >= 0; i--) {
            const acceptedChars = suggestion.substring(0, i);
            const remainingChars = suggestion.substring(i);

            if (acceptedChars.trim().length === 0) {
                continue;
            }

            this.suggestionCache.set(JSON.stringify({prefix: prefix + acceptedChars, suffix}), remainingChars);
        }
    }


}

function createPredictionService(settings: Settings) {
    return ChatGPTWithReasoning.fromSettings(settings);
}

export default EventListener;
