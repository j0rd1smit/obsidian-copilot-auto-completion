import State from "./state";
import {Settings} from "../settings/versions";
import { TFile } from "obsidian";

class DisabledManualState extends State {
    getStatusBarText(): string {
        return "Disabled";
    }

    handleSettingChanged(settings: Settings): void {
        if (this.context.settings.enabled) {
            this.context.transitionToIdleState();
        }
    }

    handleFileChange(file: TFile): void {}
}

export default DisabledManualState;
