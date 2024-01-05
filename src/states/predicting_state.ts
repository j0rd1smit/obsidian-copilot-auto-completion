import State from "./state";
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import IdleState from "./idle_state";
import SuggestingState from "./suggesting_state";
import { Notice } from "obsidian";
import Context from "../context_detection";

class PredictingState extends State {
    private predictionPromise: Promise<void> | null = null;
    private isStillNeeded = true;
    private readonly prefix: string;
    private readonly suffix: string;

    constructor(context: EventListener, prefix: string, suffix: string) {
        super(context);
        this.prefix = prefix;
        this.suffix = suffix;
    }

    static createAndStartPredicting(
        context: EventListener,
        prefix: string,
        suffix: string
    ): PredictingState {
        const predictingState = new PredictingState(context, prefix, suffix);
        predictingState.startPredicting();
        context.setContext(Context.getContext(prefix, suffix));
        return predictingState;
    }

    handleCancelKeyPressed(): boolean {
        this.cancelPrediction();
        return true;
    }

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (
            documentChanges.hasCursorMoved() ||
            documentChanges.hasUserTyped() ||
            documentChanges.hasUserDeleted() ||
            documentChanges.isTextAdded()
        ) {
            this.cancelPrediction();
        }
    }

    private cancelPrediction(): void {
        this.isStillNeeded = false;
        this.context.transitionTo(new IdleState(this.context));
    }

    startPredicting(): void {
        this.predictionPromise = this.predict();
    }

    private async predict(): Promise<void> {
        try {
            const prediction =
                await this.context.predictionService?.fetchPredictions(
                    this.prefix,
                    this.suffix
                );

            if (!this.isStillNeeded) {
                return;
            }
            if (prediction === undefined) {
                this.context.transitionTo(new IdleState(this.context));
                return;
            }
            this.context.transitionTo(
                SuggestingState.withSuggestion(this.context, prediction)
            );
        } catch (error) {
            console.error(error);
            new Notice(
                `Something went wrong cannot make a prediction. Full error is available in the dev console. Please check your settings. `
            );
            this.context.transitionTo(new IdleState(this.context));
            return;
        }
    }

    getStatusBarText(): string {
        return `Predicting for ${this.context.context}`;
    }
}

export default PredictingState;
