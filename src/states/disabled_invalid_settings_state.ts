import State from "./state";
import {Settings} from "../settings/versions";
import {checkForErrors} from "../settings/utils";

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
            this.context.transitionToIdleState();
        } else {
            this.context.transitionToDisabledManualState();
        }
    }

}

export default DisabledInvalidSettingsState;
