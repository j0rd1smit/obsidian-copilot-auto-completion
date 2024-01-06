
import { DocumentChanges } from "../render_plugin/document_changes_listener";
import {Settings} from "../settings/versions";


export interface EventHandler  {
    handleSettingChanged(settings: Settings): void;

    handleDocumentChange(documentChanges: DocumentChanges): Promise<void>;

    handleAcceptKeyPressed(): boolean;

    handlePartialAcceptKeyPressed(): boolean;
    handlePartialUndoKeyPressed(): boolean;

    handleCancelKeyPressed(): boolean;

    handlePredictCommand(prefix: string, suffix: string): void;
    handleAcceptCommand(): void;

    getStatusBarText(): string;

    handleFilePathChange(path: string): void;

}
