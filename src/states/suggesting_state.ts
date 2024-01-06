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

        const currentPrefix = documentChanges.getPrefix();
        const currentSuffix = documentChanges.getSuffix();
        const suggestion = this.context.getCachedSuggestionFor(currentPrefix, currentSuffix);
        if (
            documentChanges.getPrefix() !== this.prefix
            && documentChanges.getSuffix() !== this.suffix
            && suggestion !== undefined
        ) {
            this.context.transitionToSuggestingState(suggestion, currentPrefix, currentSuffix);
            return;
        }

        if (documentChanges.hasUserTyped() && this.hasUserAddedPartOfSuggestion(documentChanges)) {
            this.acceptPartialAddedText(documentChanges);
            return
        }

        if (documentChanges.getPrefix() !== this.prefix || documentChanges.getSuffix() !== this.suffix) {
            this.clearPrediction();
            return
        }

        if (this.suggestion.trim() === "") {
            this.clearPrediction();
            return;
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
        const remainingSuggestion = this.suggestion.substring(startIdx, endIdx);

        if (remainingSuggestion.trim() === "") {
            this.clearPrediction();
        } else {
            this.context.transitionToSuggestingState(remainingSuggestion, documentChanges.getPrefix(), documentChanges.getSuffix());
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
        this.addPartialSuggestionCaches(this.suggestion);
    }

    handlePartialAcceptKeyPressed(): boolean {
        this.acceptNextWord();
        return true;
    }

    private acceptNextWord() {
        const nextWord = this.getNextWord();
        if (nextWord !== undefined) {
            const acceptedPart = nextWord + " ";
            const remainingSuggestion = this.suggestion.substring(acceptedPart.length);
            const updatedPrefix = this.prefix + acceptedPart;

            this.context.insertCurrentSuggestion(acceptedPart);
            this.addPartialSuggestionCaches(acceptedPart, remainingSuggestion);
            this.context.transitionToSuggestingState(remainingSuggestion, updatedPrefix, this.suffix);
        } else {
            this.accept();
        }
    }

    private addPartialSuggestionCaches(acceptSuggestion: string, remainingSuggestion = "") {
        // store the sub-suggestions in the cache
        // so that we can have partial suggestions if the user edits a part
        for (let i = 0; i < acceptSuggestion.length; i++) {
            const prefix = this.prefix + acceptSuggestion.substring(0, i);
            const suggestion = acceptSuggestion.substring(i) + remainingSuggestion;
            this.context.addSuggestionToCache(prefix, this.suffix, suggestion);
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
