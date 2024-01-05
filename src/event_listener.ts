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


class EventListener implements EventHandler, SettingsObserver {
    private view: EditorView | null = null;

    private state: EventHandler = new InitState();
    private statusBar: StatusBar;
    context: Context = Context.Text;
    predictionService: PredictionService;
    settings: Settings;
    private currentFilePath: string | null = null;

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

    setSuggestion(suggestion: string): void {
        if (this.view === null) {
            return;
        }
        updateSuggestion(this.view, suggestion);
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
}

function createPredictionService(settings: Settings) {
    return ChatGPTWithReasoning.fromSettings(settings);
}

export default EventListener;
