import State from "./state";
import {Settings} from "../settings/versions";

class DisabledManualState extends State {
    getStatusBarText(): string {
        return "Disabled";
    }

    handleSettingChanged(settings: Settings): void {
        if (this.context.settings.enabled) {
            this.context.transitionToIdleState();
        }
    }

    handleFilePathChange(path: string): void {}
}

export default DisabledManualState;
