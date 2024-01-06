import State from "./state";
import {DocumentChanges} from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import IdleState from "./idle_state";

class SuggestingState extends State {
    private readonly suggestion: string;
    private readonly prefix: string;
    private readonly suffix: string;


    constructor(context: EventListener, suggestion: string, prefix: string, suffix: string) {
        super(context);
        this.suggestion = suggestion;
        this.prefix = prefix;
        this.suffix = suffix;
    }


    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (!documentChanges.isDocInFocus()) {
            return;
        }

        if (documentChanges.hasUserTyped() && this.hasUserAddedPartOfSuggestion(documentChanges)) {
            this.acceptPartialAddedText(documentChanges);
            return
        }

        if (
            documentChanges.hasCursorMoved()
            || documentChanges.hasUserDeleted()
            || documentChanges.hasUserTyped()
            || documentChanges.hasUserUndone()
        ) {

            if (this.context.hasCachedSuggestionsFor(documentChanges.getPrefix(), documentChanges.getSuffix())) {
                const suggestion = this.context.getCachedSuggestionFor(documentChanges.getPrefix(), documentChanges.getSuffix());
                if (suggestion !== undefined) {
                    this.context.transitionToSuggestingState(suggestion, documentChanges.getPrefix(), documentChanges.getSuffix());
                }
            } else {
                this.clearPrediction();
                return
            }
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
        if (suggestion.trim() === "") {
            this.clearPrediction();
        } else {
            this.context.transitionToSuggestingState(suggestion, documentChanges.getPrefix(), documentChanges.getSuffix());
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
        const nextWord = this.getNextWord();
        if (nextWord !== undefined) {
            const part = nextWord + " ";
            const updatedSuggestion = this.suggestion.substring(part.length);
            const updatedPrefix = this.prefix + part;
            this.context.insertCurrentSuggestion(part);
            this.context.transitionToSuggestingState(updatedSuggestion, updatedPrefix, this.suffix);
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

    handleCancelKeyPressed(): boolean {
        this.context.clearSuggestionsCache();
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
