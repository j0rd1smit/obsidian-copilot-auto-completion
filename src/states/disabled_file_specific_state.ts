import State from "./state";
import {Settings} from "../settings/versions";
import { TFile } from "obsidian";


class DisabledFileSpecificState extends State {
    getStatusBarText(): string {
        return "Disabled for this file";
    }

    handleSettingChanged(settings: Settings) {
        if (!this.context.settings.enabled) {
            this.context.transitionToDisabledManualState();
        }
        if (!this.context.isCurrentFilePathIgnored() || !this.context.currentFileContainsIgnoredTag()) {
            this.context.transitionToIdleState();
        }
    }

    handleFileChange(file: TFile): void {
        if (this.context.isCurrentFilePathIgnored() || this.context.currentFileContainsIgnoredTag()) {
            return;
        }

        if (this.context.settings.enabled) {
            this.context.transitionToIdleState();
        } else {
            this.context.transitionToDisabledManualState();
        }
    }
}

export default DisabledFileSpecificState;
