import {DEFAULT_SETTINGS, PluginData, Settings, settingsSchema} from "./versions";
import {z, ZodError, ZodType, ZodIssueCode} from 'zod';
import {cloneDeep, get, has, set, unset} from "lodash";
import {isSettingsV0, isSettingsV1, migrateFromV0ToV1} from "./versions/migration";
import {err, ok, Result} from "neverthrow";
import * as mm from "micromatch";



type JSONObject = Record<string, any>;

export function checkForErrors(settings: Settings) {
    const errors = new Map<string, string>();
    const parsingResult = parseWithSchema(settingsSchema, settings);

    if (parsingResult.isOk()) {
        return errors;
    }

    if (parsingResult.error instanceof ZodError) {
        for (const issue of parsingResult.error.issues) {
            errors.set(issue.path.join('.'), issue.message);
        }
    } else {
        throw parsingResult.error;
    }

    return errors;
}


export function fixStructureAndValueErrors<T extends ZodType>(
    schema: T,
    value: any|null|undefined,
    defaultValue: z.infer<T>,
): Result<ReturnType<T["parse"]>, Error> {
    if (value === null || value === undefined) {
        value = {};
    }
    let result = parseWithSchema(schema, value);

    if (result.isErr()) {
        value = addMissingKeys(value, result.error, defaultValue);
        value = removeUnrecognizedKeys(value, result.error);
        result = parseWithSchema(schema, value);
    }

    if (result.isErr() && value !== null && value !== undefined) {
        value = replaceValuesWithErrorsByDefaultValue(value, result.error, defaultValue);
        result = parseWithSchema(schema, value);
    }

    return result;
}

export function parseWithSchema<T extends ZodType>(
    schema: T,
    value: JSONObject | null | undefined
): Result<ReturnType<T["parse"]>, ZodError> {
    const parsingResult = schema.safeParse(value);
    return parsingResult.success ? ok(parsingResult.data) : err(parsingResult.error);
}

function addMissingKeys<T extends object>(value: JSONObject, error: ZodError, defaultValue: T): JSONObject {
    const invalidTypeIssues = error.issues.filter(issue => issue.code === ZodIssueCode.invalid_type);
    const errorPaths = invalidTypeIssues
        .map(issue => issue.path)
        .map(path => reduceArrayPathToFirstObjectPath(path))
        .map(path => path.join('.'));

    return replaceValueWithDefaultValue(value, errorPaths, defaultValue);
}

function replaceValueWithDefaultValue<V, T>(
    value: any,
    paths: string[],
    defaultValue: T,
): V {
    const result = cloneDeep(value) as any;
    paths.forEach(path => {
        const originalValue = has(defaultValue, path) ? get(defaultValue, path) : undefined;
        set(result, path, originalValue);
    });

    return result;
}


function removeUnrecognizedKeys(value: JSONObject | null | undefined, error: ZodError): JSONObject {
    if (typeof value !== 'object' || value === null || value === undefined) {
        return {};
    }
    // Zod unrecognized_keys issues consist of two parts:
    // - path to the nested object where the unrecognized key was found
    // - the key itself which is unrecognized
    const unrecognizedPaths = error.issues

        .filter(issue => issue.code === ZodIssueCode.unrecognized_keys)
        // Array path will be handled separately by the value replacement function
        .filter(issue => !isAnArrayPath(issue.path))
        .flatMap(issue => {
            // @ts-ignore
            const keys = issue.keys;
            return keys.map(key => [...issue.path, key].join('.'));
        });

    unrecognizedPaths.forEach(path => {
        unset(value, path);
    });
    return value;
}


function replaceValuesWithErrorsByDefaultValue<T>(
    value: JSONObject,
    error: ZodError,
    defaultValue: T
): T {
    const errorPaths = error.issues
        .map(issue => issue.path)
        .map(path => reduceArrayPathToFirstObjectPath(path))
        .map(path => path.join('.'));

    return replaceValueWithDefaultValue(value, errorPaths, defaultValue);
}

function reduceArrayPathToFirstObjectPath(path: (string | number)[]): (string | number)[] {
    const result: (string | number)[] = [];
    for (const key of path) {
        if (typeof key === 'number') {
            break;
        }
        result.push(key);
    }

    return result;
}

function isAnArrayPath(path: (string | number)[]): boolean {
    return path.some(key => typeof key === 'number');
}

export function serializeSettings(settings: Settings): PluginData {
    return {settings: settings};
}

export function deserializeSettings(data: JSONObject|null|undefined): Result<Settings, Error> {
    let settings: any;
    if (data === null || data === undefined || !data.hasOwnProperty("settings")) {
        settings = {};
    } else  {
        settings = data.settings;
    }

    if (isSettingsV0(settings)) {
        settings = migrateFromV0ToV1(settings);
    }
    if (!isSettingsV1(settings)) {
        return fixStructureAndValueErrors(settingsSchema, DEFAULT_SETTINGS, settings);
    }

    return parseWithSchema(settingsSchema, settings);
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

export function isValidIgnorePattern(value: string): boolean {
    try {
        mm.isMatch("", value);
        return true;
    } catch (e) {
        return false;
    }
}
