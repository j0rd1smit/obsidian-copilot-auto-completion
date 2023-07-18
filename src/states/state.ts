import { DocumentChanges } from "../render_plugin/document_changes_listener";
import EventListener from "../event_listener";
import { EventHandler } from "./types";

abstract class State implements EventHandler {
    protected readonly context: EventListener;

    constructor(context: EventListener) {
        this.context = context;
    }

    handleSettingChanged(): void {}

    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {}

    handleAcceptonKeyPressed(): boolean {
        return false;
    }

    handleCancelKeyPressed(): boolean {
        return false;
    }

    handlePredictCommand(prefix: string, suffix: string): void {}
    handleAcceptCommand(): void {}
}

export default State;
