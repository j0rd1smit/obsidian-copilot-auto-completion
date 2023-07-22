import State from "./state";
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import QueuedState from "./queued_state";
import PredictingState from "./predicting_state";

class IdleState extends State {
    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {
        if (
            documentChanges.isDocInFocus() &&
            documentChanges.hasUserTyped() &&
            this.containsTriggerCharacters(documentChanges)
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

    private containsTriggerCharacters(
        documentChanges: DocumentChanges
    ): boolean {
        for (const trigger of this.context.settings.triggers) {
            if (trigger.type === "string" && documentChanges.getPrefix().endsWith(trigger.value)) {
                return true;
            }
            if (trigger.type === "regex" && documentChanges.getPrefix().match(trigger.value)) {
                return true;
            }


        }
        return false;
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
}

export default IdleState;
