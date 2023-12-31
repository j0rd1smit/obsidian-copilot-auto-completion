import {Settings, SettingsObserver} from "./settings/settings";
import StatusBar from "./status_bar";
import {DocumentChanges} from "./render_plugin/document_changes_listener";
import {cancelSuggestion, insertSuggestion, updateSuggestion,} from "./render_plugin/states";
import {EditorView} from "@codemirror/view";
import State from "./states/state";
import {EventHandler} from "./states/types";
import InitState from "./states/init_state";
import IdleState from "./states/idle_state";
import QueuedState from "./states/queued_state";
import DisabledState from "./states/disabled_state";
import PredictingState from "./states/predicting_state";
import SuggestingState from "./states/suggesting_state";
import {PredictionService} from "./prediction_services/types";
import ChatGPTWithReasoning from "./prediction_services/chat_gpt_with_reasoning";
import {checkForErrors} from "./settings/utils";
import {Notice} from "obsidian";
import Context from "./context_detection";

class EventListener implements EventHandler, SettingsObserver {
    private view: EditorView | null = null;

    private state: EventHandler = new InitState();
    private statusBar: StatusBar;
    private context: Context = Context.Text;
    predictionService: PredictionService;
    settings: Settings;

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
        if (settings.enabled && settingErrors.size === 0) {
            eventListener.transitionTo(new IdleState(eventListener));
        } else {
            eventListener.transitionTo(new DisabledState(eventListener));
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

    private updateStatusBarText(): void {
         const prefix = "Copilot:";

         if (this.state instanceof IdleState) {
            this.statusBar.updateText(`${prefix} Idle`);
        } else if (this.state instanceof QueuedState) {
            this.statusBar.updateText(`${prefix} Queued`);
        } else if (this.state instanceof DisabledState) {
            this.statusBar.updateText(`${prefix} Disabled`);
        } else if (this.state instanceof PredictingState) {
            this.statusBar.updateText(`${prefix} Predicting for ${this.context}`);
        } else if (this.state instanceof SuggestingState) {
            this.statusBar.updateText(`${prefix} Suggesting for ${this.context}`);
        }
    }

    handleSettingChanged(settings: Settings): void {
        const fromDisabledToEnabled = !this.settings.enabled && settings.enabled;
        const fromEnabledToDisabled = this.settings.enabled && !settings.enabled;


        const settingErrors = checkForErrors(settings);
        if (!settings.enabled) {
            if (fromDisabledToEnabled) {
                new Notice("Copilot is disabled.");
            }

            this.transitionTo(new DisabledState(this));
        } else if (settingErrors.size > 0) {
            new Notice(
                `There are ${settingErrors.size} errors in your settings. Please before enable Copilot.`
            );
            this.transitionTo(new DisabledState(this));
        } else {
            if (fromEnabledToDisabled) {
                new Notice("Copilot is enabled.");
            }
            this.predictionService = createPredictionService(settings);
            this.transitionTo(new IdleState(this));
        }
         this.settings = settings;
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
}

function createPredictionService(settings: Settings) {
    return ChatGPTWithReasoning.fromSettings(settings);
}

export default EventListener;
