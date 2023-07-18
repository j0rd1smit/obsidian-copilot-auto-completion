import State from "./state";
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import IdleState from "./idle_state";
import PredictingState from "./predicting_state";

class QueuedState extends State {
    private timer: NodeJS.Timeout | null = null;
    private readonly prefix: string;
    private readonly suffix: string;

    private constructor(
        context: EventListener,
        prefix: string,
        suffix: string
    ) {
        super(context);
        this.prefix = prefix;
        this.suffix = suffix;
    }

    static createAndStartTimer(
        context: EventListener,
        prefix: string,
        suffix: string
    ): QueuedState {
        const state = new QueuedState(context, prefix, suffix);
        state.startTimer();
        return state;
    }

    handleCancelKeyPressed(): boolean {
        this.cancelTimer();
        this.context.transitionTo(new IdleState(this.context));
        return true;
    }

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (
            documentChanges.hasCursorMoved() ||
            documentChanges.hasUserTyped() ||
            documentChanges.hasUserDeleted() ||
            documentChanges.isTextAdded() ||
            !documentChanges.isDocInFocus()
        ) {
            this.cancelTimer();
            this.context.transitionTo(new IdleState(this.context));
        }
    }

    startTimer(): void {
        this.cancelTimer();
        this.timer = setTimeout(() => {
            this.context.transitionTo(
                PredictingState.createAndStartPredicting(
                    this.context,
                    this.prefix,
                    this.suffix
                )
            );
        }, this.context.settings.delay);
    }

    private cancelTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export default QueuedState;
