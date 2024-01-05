import State from "./state";
import {Settings} from "../settings/versions";
import IdleState from "./idle_state";

class DisabledManualState extends State {
    getStatusBarText(): string {
        return "Disabled";
    }

    handleSettingChanged(settings: Settings): void {
        if (this.context.settings.enabled) {
            this.context.transitionTo(new IdleState(this.context));
        }
    }

    handleFilePathChange(path: string): void {}
}

export default DisabledManualState;
