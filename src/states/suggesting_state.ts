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
            documentChanges.hasUserUndone() ||
            documentChanges.isTextAdded()
        ) {
            this.clearPrediction();
        }
    }

    private clearPrediction(): void {
        this.context.cancelSuggestion();
        this.context.transitionTo(new IdleState(this.context));
    }

    handleAcceptKeyPressed(): boolean {
        this.accept();
        return true;
    }
    private accept() {
        this.context.insertCurrentSuggestion(this.suggestion);
        this.context.transitionTo(new IdleState(this.context));
    }

    handlePartialAcceptKeyPressed(): boolean {
        this.acceptPartial();
        return true;
    }
    private acceptPartial() {
        if (this.suggestion.includes(" ")) {
            const part = this.suggestion.split(" ")[0] + " ";
            this.context.insertCurrentSuggestion(part);
            this.context.transitionTo(
                SuggestingState.withSuggestion(
                    this.context,
                    this.suggestion.substring(part.length)
                )
            );
        } else {
            this.accept();
        }
    }

    handleCancelKeyPressed(): boolean {
        this.clearPrediction();
        return true;
    }

    handleAcceptCommand() {
        this.accept();
    }

    getStatusBarText(): string {
        return `Suggesting for ${this.context.context}`;
    }
}

export default SuggestingState;
