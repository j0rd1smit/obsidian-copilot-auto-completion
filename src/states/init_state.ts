import { DocumentChanges } from "../render_plugin/document_changes_listener";
import { SettingsTab } from "../settings/SettingsTab";
import { EventHandler } from "./types";

class InitState implements EventHandler {
    async handleDocumentChange(
        documentChanges: DocumentChanges
    ): Promise<void> {}

    handleSettingChanged(settings: SettingsTab): void {}

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
}

export default InitState;
