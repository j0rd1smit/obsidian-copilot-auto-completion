import {describe, expect, test} from "@jest/globals";
import {DEFAULT_SETTINGS, settingsSchema} from "../../../settings/versions";
import {cloneDeep} from "lodash";


describe('smoketest', () => {
    test("default settings should be valid", () => {
        const parsed = settingsSchema.parse(cloneDeep(DEFAULT_SETTINGS));
        expect(parsed).toEqual(DEFAULT_SETTINGS);
    });
});
