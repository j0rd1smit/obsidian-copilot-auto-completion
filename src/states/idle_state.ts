import State from "./state";
import {DocumentChanges} from "../render_plugin/document_changes_listener";


class IdleState extends State {

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (
            !documentChanges.isDocInFocus()
            || !documentChanges.hasDocChanged()
            || documentChanges.hasUserDeleted()
            || documentChanges.hasMultipleCursors()
            || documentChanges.hasSelection()
            || documentChanges.hasUserUndone()
            || documentChanges.hasUserRedone()
        ) {
            return;
        }

        const cachedSuggestion = this.context.getCachedSuggestionFor(documentChanges.getPrefix(), documentChanges.getSuffix());
        const isThereCachedSuggestion = cachedSuggestion !== undefined && cachedSuggestion.trim().length > 0;

        if (this.context.settings.cacheSuggestions && isThereCachedSuggestion) {
            this.context.transitionToSuggestingState(cachedSuggestion, documentChanges.getPrefix(), documentChanges.getSuffix());
            return;

        }

        if (this.context.containsTriggerCharacters(documentChanges)) {
           this.context.transitionToQueuedState(documentChanges.getPrefix(), documentChanges.getSuffix());
        }
    }

    handlePredictCommand(prefix: string, suffix: string): void {
        this.context.transitionToPredictingState(prefix, suffix);
    }

    getStatusBarText(): string {
        return "Idle";
    }
}

export default IdleState;
