import { Settings } from "../settings/settings";
import { DocumentChanges } from "../render_plugin/document_changes_listener";

export interface EventHandler {
    handleSettingChanged(settings: Settings): void;

    handleDocumentChange(documentChanges: DocumentChanges): Promise<void>;

    handleAcceptKeyPressed(): boolean;

    handlePartialAcceptKeyPressed(): boolean;

    handleCancelKeyPressed(): boolean;

    handlePredictCommand(prefix: string, suffix: string): void;
    handleAcceptCommand(): void;
}
