import State from "./state";
import {Settings} from "../settings/versions";
import IdleState from "./idle_state";
import DisabledManualState from "./disabled_manual_state";

class DisabledFileSpecificState extends State {
    getStatusBarText(): string {
        return "Disabled for this file";
    }

    handleSettingChanged(settings: Settings) {
        if (!this.context.settings.enabled) {
            this.context.transitionTo(new DisabledManualState(this.context));
        } if (!this.context.isCurrentFilePathIgnored()) {
            this.context.transitionTo(new IdleState(this.context));
        }
    }

    handleFilePathChange(path: string): void {
        if (this.context.isCurrentFilePathIgnored()) {
            return
        }

        if (this.context.settings.enabled) {
            this.context.transitionTo(new IdleState(this.context));
        } else {
            this.context.transitionToDisabledManualState();
        }

    }
}

export default DisabledFileSpecificState;
