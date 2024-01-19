import State from "./state";
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import Context from "../context_detection";


class QueuedState extends State {
    private timer: ReturnType<typeof setTimeout> | null = null;
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
        context.setContext(Context.getContext(prefix, suffix));
        return state;
    }

    handleCancelKeyPressed(): boolean {
        this.cancelTimer();
        this.context.transitionToIdleState();
        return true;
    }

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (
            documentChanges.isDocInFocus() &&
            documentChanges.isTextAdded() &&
            this.context.containsTriggerCharacters(documentChanges)
        ) {
            this.cancelTimer();
            this.context.transitionToQueuedState(documentChanges.getPrefix(), documentChanges.getSuffix());
            return
        }
        if (
            (documentChanges.hasCursorMoved() ||
            documentChanges.hasUserTyped() ||
            documentChanges.hasUserDeleted() ||
            documentChanges.isTextAdded() ||
            !documentChanges.isDocInFocus())
        ) {
            this.cancelTimer();
            this.context.transitionToIdleState();
        }
    }

    startTimer(): void {
        this.cancelTimer();
        this.timer = setTimeout(() => {
            this.context.transitionToPredictingState(this.prefix, this.suffix);
        }, this.context.settings.delay);
    }

    private cancelTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    getStatusBarText(): string {
        return `Queued (${this.context.settings.delay} ms)`;
    }
}

export default QueuedState;
