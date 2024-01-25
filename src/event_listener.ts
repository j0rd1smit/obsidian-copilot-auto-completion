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
import QueuedState from "./states/queued_state";
import PredictingState from "./states/predicting_state";
import { TFile } from "obsidian";


const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const MAX_N_ITEMS_IN_CACHE = 5000;

class EventListener implements EventHandler, SettingsObserver {
    private view: EditorView | null = null;

    private state: EventHandler = new InitState();
    private statusBar: StatusBar;
    context: Context = Context.Text;
    predictionService: PredictionService;
    settings: Settings;
    private currentFile: TFile | null = null;
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
            eventListener.transitionToIdleState()
        } else if (settingErrors.size > 0) {
            eventListener.transitionToDisabledInvalidSettingsState();
        } else if (!settings.enabled) {
            eventListener.transitionToDisabledManualState();
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

    public handleFileChange(file: TFile): void {
        this.currentFile = file;
        this.state.handleFileChange(file);

    }

    public isCurrentFilePathIgnored(): boolean {
        if (this.currentFile === null) {
            return false;
        }
        const patterns = this.settings.ignoredFilePatterns.split("\n");
        return isMatchBetweenPathAndPatterns(this.currentFile.path, patterns);
    }

    public currentFileContainsIgnoredTag(): boolean {
        if (this.currentFile === null) {
            return false;
        }

        const ignoredTags = this.settings.ignoredTags.toLowerCase().split(/[\s,]+/);

        const metadata = app.metadataCache.getFileCache(this.currentFile);
        if (!metadata || !metadata.tags) {
            return false;
        }

        const tags = metadata.tags.map(tag => tag.tag.toLowerCase());
        return tags.some(tag => ignoredTags.includes(tag));
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

    private transitionTo(state: State): void {
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

    transitionToQueuedState(prefix: string, suffix: string): void {
        this.transitionTo(
            QueuedState.createAndStartTimer(
                this,
                prefix,
                suffix
            )
        );
    }

    transitionToPredictingState(prefix: string, suffix: string): void {
        this.transitionTo(PredictingState.createAndStartPredicting(
                this,
                prefix,
                suffix
            )
        );
    }

    transitionToSuggestingState(
        suggestion: string,
        prefix: string,
        suffix: string,
        addToCache = true
    ): void {
        if (this.view === null) {
            return;
        }
        if (suggestion.trim().length === 0) {
            this.transitionToIdleState();
            return;
        }
        if (addToCache) {
            this.addSuggestionToCache(prefix, suffix, suggestion);
        }
        this.transitionTo(new SuggestingState(this, suggestion, prefix, suffix));
        updateSuggestion(this.view, suggestion);
    }

    public transitionToIdleState() {
        const previousState = this.state;

        this.transitionTo(new IdleState(this));

        if (previousState instanceof SuggestingState) {
            this.cancelSuggestion();
        }
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

    public getCachedSuggestionFor(prefix: string, suffix: string): string | undefined {
        return this.suggestionCache.get(this.getCacheKey(prefix, suffix));
    }

    private getCacheKey(prefix: string, suffix: string): string {
        const nCharsToKeepPrefix = prefix.length;
        const nCharsToKeepSuffix = suffix.length;

        return `${prefix.substring(prefix.length - nCharsToKeepPrefix)}<mask/>${suffix.substring(0, nCharsToKeepSuffix)}`
    }

    public clearSuggestionsCache(): void {
        this.suggestionCache.clear();
    }

    public addSuggestionToCache(prefix: string, suffix: string, suggestion: string): void {
        if (!this.settings.cacheSuggestions) {
            return;
        }
        this.suggestionCache.set(this.getCacheKey(prefix, suffix), suggestion);
    }
}

function createPredictionService(settings: Settings) {
    return ChatGPTWithReasoning.fromSettings(settings);
}

export default EventListener;
