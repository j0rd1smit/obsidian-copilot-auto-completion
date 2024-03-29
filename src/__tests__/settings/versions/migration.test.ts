import {expect, test} from "@jest/globals";
import * as fs from 'fs';
import * as path from 'path';
import {isSettingsV0, isSettingsV1, migrateFromV0ToV1} from "../../../settings/versions/migration";
import {DEFAULT_SETTINGS as DEFAULT_SETTINGS_V0, Settings as SettingsV0, Trigger} from "../../../settings/versions/v0/v0";
import {settingsSchema as settingsSchemaV1} from "../../../settings/versions/v1/v1";
import {cloneDeep} from "lodash";
import {isRegexValid, parseWithSchema} from "../../../settings/utils";


test('Verify settings_v0.json is a valid SettingV0', () => {
    const filePath = path.join(__dirname, 'settings_v0.json');
    const pluginData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rawSettingV0 = pluginData.settings;

    expect(isSettingsV0(rawSettingV0)).toEqual(true);
});

test('Verify settings_v0.json can be migrated to SettingV1', () => {
    const filePath = path.join(__dirname, 'settings_v0.json');
    const pluginData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rawSettingV0 = pluginData.settings;

    expect(isSettingsV1(rawSettingV0)).toEqual(false);

    const rawSettingV1 = migrateFromV0ToV1(rawSettingV0);
    const result = parseWithSchema(settingsSchemaV1, rawSettingV1);

    expect(result.isOk()).toEqual(true);
});


test('Verify migration from v0 to v1 fixes regex not ending with $ issue.', () => {
    const triggers: Trigger[] = [{"type": "regex", "value": "" }, {"type": "regex", "value": "fnjanf"}];
    const settingsV0: SettingsV0 = {...cloneDeep(DEFAULT_SETTINGS_V0), triggers: triggers};

    const settingsV1 = migrateFromV0ToV1(settingsV0);

    settingsV0.triggers.forEach((trigger: any) => {
        expect(trigger.value.endsWith('$')).toEqual(false);
    });
    settingsV1.triggers.forEach((trigger: any) => {
        expect(trigger.value.endsWith('$')).toEqual(true);
    });
});


test('Verify migration from v0 to v1 changes the version to v1', () => {
    const settingsV0: SettingsV0 = cloneDeep(DEFAULT_SETTINGS_V0);

    const settingsV1 = migrateFromV0ToV1(settingsV0);

    expect(settingsV1.version).toEqual("1");
});

test('Verify migration from v0 to v1 fixes removes invalid regex', () => {
    const triggers: Trigger[] = [{"type": "regex", "value": "[" }];
    const settingsV0: SettingsV0 = {...cloneDeep(DEFAULT_SETTINGS_V0), triggers: triggers};

    const settingsV1 = migrateFromV0ToV1(settingsV0);

    settingsV0.triggers.forEach((trigger: any) => {
        expect(isRegexValid(trigger.value)).toEqual(false);
    });
    settingsV1.triggers.forEach((trigger: any) => {
        expect(isRegexValid(trigger.value)).toEqual(true);
    });
});

test('Verify migration from v0 to v1 fixes removes triggers with empty values', () => {
    const triggers: Trigger[] = [{"type": "regex", "value": ""}, {"type": "regex", "value": "[A-Z]+$" }, {"type": "string", "value": "" }, {"type": "string", "value": "something something" }];
    const settingsV0: SettingsV0 = {...cloneDeep(DEFAULT_SETTINGS_V0), triggers: triggers};

    const settingsV1 = migrateFromV0ToV1(settingsV0);


    settingsV1.triggers.forEach((trigger: any) => {
        expect(trigger.value.length).toBeGreaterThan(0);
    });
});

