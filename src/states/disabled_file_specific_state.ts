import State from "./state";
import {Settings} from "../settings/versions";


class DisabledFileSpecificState extends State {
    getStatusBarText(): string {
        return "Disabled for this file";
    }

    handleSettingChanged(settings: Settings) {
        if (!this.context.settings.enabled) {
            this.context.transitionToDisabledManualState();
        } if (!this.context.isCurrentFilePathIgnored()) {
            this.context.transitionToIdleState();
        }
    }

    handleFilePathChange(path: string): void {
        if (this.context.isCurrentFilePathIgnored()) {
            return
        }

        if (this.context.settings.enabled) {
            this.context.transitionToIdleState();
        } else {
            this.context.transitionToDisabledManualState();
        }

    }
}

export default DisabledFileSpecificState;
