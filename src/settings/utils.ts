import {DEFAULT_SETTINGS, PluginData, Settings, settingsSchema} from "./versions";
import {z, ZodError, ZodType} from 'zod';
import {cloneDeep, merge, omit} from "lodash";
import {isSettingsV0, isSettingsV1, migrateFromV0ToV1} from "./versions/migration";


export function checkForErrors(settings: Settings) {
    const errors = new Map<string, string>();

    try {
        settingsSchema.parse(settings);
    } catch (error) {
        if (!(error instanceof z.ZodError)) {
            throw error;
        }
        // Transform ZodError into a Map for compatibility with UI.
        for (const issue of error.issues) {
            errors.set(issue.path.join('.'), issue.message);
        }
    }

    return errors;
}

export function fixStructureAndValueErrors<T extends ZodType>(
    schema: T,
    defaultValue: z.infer<T>,
    value: any
): ReturnType<T["parse"]> {
    const mergedValue = merge({}, defaultValue, value);
    try {
        // 1st attempt to parse the value
        return schema.parse(mergedValue);
    } catch (error) {
        if (!(error instanceof ZodError)) {
            throw error;
        }
        const unrecognizedKeys = error.issues
            .filter(issue => issue.code === 'unrecognized_keys')
            // @ts-ignore
            .flatMap(issue => issue.keys);

        let fixedValues = omit(mergedValue, unrecognizedKeys);
        fixedValues = fixValueErrors(schema, defaultValue, fixedValues);

        // 2nd attempt with unrecognized keys removed
        return schema.parse(fixedValues);
    }
}

function fixValueErrors<T>(
    schema: ZodType<T>,
    originalSettings: T,
    currentSettings: any,
): T {
    const parsingResult = schema.safeParse(currentSettings);

    if (parsingResult.success) {
        return currentSettings;
    }

    if (typeof currentSettings !== 'object' || currentSettings === null) {
        throw new Error('currentSettings must be an object.');
    }

    // Use reduce to apply corrections to each error
    const fixedSettings = parsingResult.error.errors.reduce((acc, err) => {
        return applyOriginalValueAtPath(acc, originalSettings, err.path);
    }, cloneDeep(currentSettings));

    return fixedSettings;
}


function applyOriginalValueAtPath(fixedSettings, originalSettings, path) {
    let currentFixedNode = fixedSettings;
    let currentOriginalNode = originalSettings;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (currentFixedNode[key] !== undefined && currentOriginalNode[key] !== undefined) {
            currentFixedNode = currentFixedNode[key];
            currentOriginalNode = currentOriginalNode[key];
        } else {
            // Invalid path handling
            console.error('Invalid path encountered in applyOriginalValueAtPath');
            return fixedSettings;
        }
    }

    const lastKey = path[path.length - 1];
    if (typeof lastKey === 'string' || typeof lastKey === 'number') {
        currentFixedNode[lastKey] = currentOriginalNode[lastKey];
    } else {
        console.error('Invalid key type encountered in applyOriginalValueAtPath');
    }

    return fixedSettings;
}



export function serializeSettings(settings: Settings): PluginData {
    return {settings: settings};
}

export function deserializeSettings(data: any): Settings {
    let settings = data.settings;
    if (isSettingsV0(settings)) {
        settings = migrateFromV0ToV1(settings);
    }
    if (!isSettingsV1(settings)) {
        settings = fixStructureAndValueErrors(settingsSchema, DEFAULT_SETTINGS, settings);
    }

    return settingsSchema.parse(settings);
}


export function isRegexValid(value: string): boolean {
    try {
        const regex = new RegExp(value);
        regex.test("");
        return true;
    } catch (e) {
        return false;
    }
}
