import {Settings as SettingsV0, settingsSchema as settingsSchemaV0, Trigger} from "./v0";
import {Settings as SettingsV1, DEFAULT_SETTINGS as DEFAULT_SETTINGS_V1, settingsSchema as settingsSchemaV1} from "./v1";
import {cloneDeep} from "lodash";
import {isRegexValid} from "../utils";

export function migrateFromV0ToV1(settings: SettingsV0): SettingsV1 {
    // eslint-disable  @typescript-eslint/no-explicit-any
    const updatedSettings: any = cloneDeep(settings);

    updatedSettings.triggers.forEach((trigger: Trigger) => {
        // Check if the trigger type is 'regex' and if its value does not end with '$'
        if (trigger.type === 'regex' && !trigger.value.endsWith('$')) {
            // Append '$' to the trigger value
            trigger.value += '$';
        }
    });

    updatedSettings.triggers = updatedSettings
        .triggers
        .filter((trigger: Trigger) => trigger.value.length > 0)
        .filter((trigger: Trigger) => trigger.type !== 'regex' || isRegexValid(trigger.value));

    // Add the 'version' property with the value '1'
    updatedSettings.version = '1';

    if (!isRegexValid(updatedSettings.chainOfThoughRemovalRegex)) {
        updatedSettings.chainOfThoughRemovalRegex = DEFAULT_SETTINGS_V1.chainOfThoughRemovalRegex;
    }

    updatedSettings.ignoredFilePatterns = "";
    updatedSettings.cacheSuggestions = DEFAULT_SETTINGS_V1.cacheSuggestions;

    // Parsing the updated settings to ensure they match the SettingsV1 schema
    return settingsSchemaV1.parse(updatedSettings);
}





export const isSettingsV0 = (settings: object): boolean => {
    const result = settingsSchemaV0.safeParse(settings);
    return result.success;
}


export const isSettingsV1 = (settings: object): boolean => {
    const result = settingsSchemaV1.safeParse(settings);
    return result.success;
}
