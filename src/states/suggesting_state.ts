import State from "./state";
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import IdleState from "./idle_state";

class SuggestingState extends State {
    private readonly suggestion: string;

    private constructor(context: EventListener, suggestion: string) {
        super(context);
        this.suggestion = suggestion;
    }

    static withSuggestion(
        context: EventListener,
        suggestion: string
    ): SuggestingState {
        const state = new SuggestingState(context, suggestion);
        context.setSuggestion(suggestion);
        return state;
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
            this.clearPrediction();
        }
    }

    private clearPrediction(): void {
        this.context.cancelSuggestion();
        this.context.transitionTo(new IdleState(this.context));
    }

    handleAcceptonKeyPressed(): boolean {
        this.accept();
        return true;
    }
    private accept() {
        this.context.insertCurrentSuggestion(this.suggestion);
        this.context.transitionTo(new IdleState(this.context));
    }

    handleCancelKeyPressed(): boolean {
        this.clearPrediction();
        return true;
    }

    handleAcceptCommand() {
        this.accept();
    }
}

export default SuggestingState;
