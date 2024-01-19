import { DocumentChanges } from "../render_plugin/document_changes_listener";
import { EventHandler } from "./types";
import {Settings} from "../settings/versions";

class InitState implements EventHandler {
    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {}

    handleSettingChanged(settings: Settings): void {}

    handleAcceptKeyPressed(): boolean {
        return false;
    }

    handlePartialAcceptKeyPressed(): boolean {
        return false;
    }

    handleCancelKeyPressed(): boolean {
        return false;
    }

    handlePredictCommand(): void {}

    handleAcceptCommand(): void {}

    getStatusBarText(): string {
        return "Initializing...";
    }

    handleFilePathChange(path: string): void {

    }
}

export default InitState;
