import State from "./state";
import {DocumentChanges} from "../render_plugin/document_changes_listener";
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
        suggestion: string,
    ): SuggestingState {
        const state = new SuggestingState(context, suggestion);
        context.setSuggestion(suggestion);
        return state;
    }

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (!documentChanges.isDocInFocus()) {
            return;
        }
        if (documentChanges.hasUserUndone()) {
            // TOOD check cache
            this.clearPrediction();
            return
        }

        if (documentChanges.hasUserTyped() && this.hasUserAddedPartOfSuggestion(documentChanges)) {
            this.acceptPartialAddedText(documentChanges);
            return
        }

        if (
            documentChanges.hasCursorMoved()
            || documentChanges.hasUserDeleted()
            || documentChanges.hasUserTyped()
        ) {
            this.clearPrediction();
            return
        }
    }

    hasUserAddedPartOfSuggestion(documentChanges: DocumentChanges): boolean {
        const addedPrefixText = documentChanges.getAddedPrefixText();
        const addedSuffixText = documentChanges.getAddedSuffixText();


        return addedPrefixText !== undefined
            && addedSuffixText !== undefined
            && this.suggestion.toLowerCase().startsWith(addedPrefixText.toLowerCase())
            && this.suggestion.toLowerCase().endsWith(addedSuffixText.toLowerCase());
    }

    acceptPartialAddedText(documentChanges: DocumentChanges): void {
        const addedPrefixText = documentChanges.getAddedPrefixText();
        const addedSuffixText = documentChanges.getAddedSuffixText();
        if (addedSuffixText === undefined || addedPrefixText === undefined) {
            return;
        }

        const startIdx = addedPrefixText.length;
        const endIdx = this.suggestion.length - addedSuffixText.length
        const suggestion = this.suggestion.substring(startIdx, endIdx);
        this.updateSurroundingText(suggestion);
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
        const nextWord = this.getNextWord();
        if (nextWord !== undefined) {
            const part = nextWord + " ";
            const updatedSuggestion = this.suggestion.substring(part.length);
            this.context.insertCurrentSuggestion(part);
            this.updateSurroundingText(updatedSuggestion);
        } else {
            this.accept();
        }
    }

    private getNextWord(): string | undefined {
        const words = this.suggestion.split(" ");
        if (words.length > 0) {
            return words[0];
        }
        return undefined;
    }

    private updateSurroundingText(text: string): void {
        this.context.transitionTo(
            SuggestingState.withSuggestion(
                this.context,
                text,
            )
        );
    }

    handlePartialUndoKeyPressed(): boolean {
        this.context.undoLastInsert();
        return true;
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
