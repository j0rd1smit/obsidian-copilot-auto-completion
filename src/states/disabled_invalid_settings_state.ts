import State from "./state";
import {Settings} from "../settings/versions";
import IdleState from "./idle_state";
import {checkForErrors} from "../settings/utils";
import DisabledManualState from "./disabled_manual_state";

class DisabledInvalidSettingsState extends State {
    getStatusBarText(): string {
        return "Disabled invalid settings";
    }

    handleSettingChanged(settings: Settings) {
        const settingErrors = checkForErrors(settings);
        if (settingErrors.size > 0) {
            return
        }
        if (this.context.settings.enabled) {
            this.context.transitionTo(new IdleState(this.context));
        } else {
            this.context.transitionTo(new DisabledManualState(this.context));
        }
    }

}

export default DisabledInvalidSettingsState;
