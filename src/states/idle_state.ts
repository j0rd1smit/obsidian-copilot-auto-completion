import State from "./state";
import {DocumentChanges} from "../render_plugin/document_changes_listener";
import QueuedState from "./queued_state";
import PredictingState from "./predicting_state";

class IdleState extends State {
    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (!documentChanges.isDocInFocus()) {
            return;
        }

        if (this.context.hasCachedSuggestionsFor(documentChanges.getPrefix(), documentChanges.getSuffix())) {
            const suggestion = this.context.getCachedSuggestionFor(documentChanges.getPrefix(), documentChanges.getSuffix());
            if (suggestion !== undefined) {
                this.context.transitionToSuggestingState(suggestion, documentChanges.getPrefix(), documentChanges.getSuffix());
                return;
            }
        }

        if (
            documentChanges.hasDocChanged() &&
            this.context.containsTriggerCharacters(documentChanges)
        ) {
            this.context.transitionTo(
                QueuedState.createAndStartTimer(
                    this.context,
                    documentChanges.getPrefix(),
                    documentChanges.getSuffix()
                )
            );
        }
    }

    handlePredictCommand(prefix: string, suffix: string): void {
        this.context.transitionTo(
            PredictingState.createAndStartPredicting(
                this.context,
                prefix,
                suffix
            )
        );
    }

    getStatusBarText(): string {
        return "Idle";
    }
}

export default IdleState;
