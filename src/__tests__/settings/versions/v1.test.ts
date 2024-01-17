import {describe, expect, test} from "@jest/globals";
import {TypeOf} from "zod";
import {DEFAULT_SETTINGS, pluginDataSchema, settingsSchema, triggerSchema} from "../../../settings/versions/v1/v1";
import {cloneDeep} from "lodash";
import {
    azureOAIApiSettingsSchema,
    fewShotExampleSchema,
    modelOptionsSchema, ollamaApiSettingsSchema,
    openAIApiSettingsSchema
} from "../../../settings/versions/shared";
import Context from "../../../context_detection";
import * as fs from 'fs';
import * as path from 'path';
import {parseWithSchema} from "../../../settings/utils";
import {ok} from "neverthrow";

describe('triggerSchema', () => {
    type TriggerSchemaType = TypeOf<typeof triggerSchema>;
    const baseData: TriggerSchemaType = {type: 'string', value: 'example'};
    const propertiesNames = ["type", "value"] as Array<keyof TriggerSchemaType>

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => triggerSchema.parse(dataWithoutProperty)).toThrow();
    });

    test('successful parse type string', () => {
        const validData = {type: 'string', value: 'example'};
        expect(triggerSchema.parse(validData)).toEqual(validData);
    });

    test('successful parse type regex', () => {
        const validData = {type: 'regex', value: '\\d+$'}; // A valid regex for digits
        expect(triggerSchema.parse(validData)).toEqual(validData);
    });

    test('throw error invalid type', () => {
        const invalidData = {type: 'invalidType', value: 'example'};
        expect(() => triggerSchema.parse(invalidData)).toThrow();
    });

    test('throw error undefined fields', () => {
        const invalidData = {type: 'string', value: 'example', extraField: 'extra'};
        expect(() => triggerSchema.parse(invalidData)).toThrow();
    });

    test('throw error if regex does not end with $', () => {
        // this is constrained was added in v1
        const invalidData = {type: 'regex', value: '\\d+'};
        expect(() => triggerSchema.parse(invalidData)).toThrow();
    });

    test("throw error if value is empty", () => {
        const invalidData = {type: 'string', value: ''};
        expect(() => triggerSchema.parse(invalidData)).toThrow();
    })
});

describe('settingsSchema', () => {
    type SettingsType = TypeOf<typeof settingsSchema>;
    const validAzureSettings = azureOAIApiSettingsSchema.parse({key: 'abc123', url: 'https://example.com'});
    const validOpenAISettings = openAIApiSettingsSchema.parse({
        key: 'abc123',
        url: 'https://example.com',
        model: 'gpt-3'
    });
    const validOllamaSettings = ollamaApiSettingsSchema.parse({
        url: 'https://example.com',
        model: 'mistral',

    });
    const validTrigger = triggerSchema.parse({type: 'string', value: '# '});
    const validModelOptions = modelOptionsSchema.parse({
        temperature: 0.5,
        top_p: 0.7,
        frequency_penalty: 1,
        presence_penalty: 0.2,
        max_tokens: 150
    });
    const validFewShotExample = fewShotExampleSchema.parse({context: Context.Text, input: 'def', answer: 'ghi'});

    const baseValidData: SettingsType = {
        version: '1',
        enabled: true,
        advancedMode: false,
        apiProvider: 'azure',
        azureOAIApiSettings: validAzureSettings,
        openAIApiSettings: validOpenAISettings,
        ollamaApiSettings: validOllamaSettings,
        triggers: [validTrigger],
        delay: 1000,
        modelOptions: validModelOptions,
        systemMessage: 'System is operational.',
        fewShotExamples: [validFewShotExample],
        userMessageTemplate: 'Hello, world!',
        chainOfThoughRemovalRegex: '\\d+',
        dontIncludeDataviews: true,
        maxPrefixCharLimit: 1000,
        maxSuffixCharLimit: 1000,
        ignoredFilePatterns: '',
        removeDuplicateMathBlockIndicator: true,
        removeDuplicateCodeBlockIndicator: true,
        cacheSuggestions: true,
    };

    const missingPropertiesToTest: (keyof SettingsType)[] = Object.keys(settingsSchema.shape) as (keyof SettingsType)[];

    test('should validate successfully with all valid properties', () => {
        expect(settingsSchema.parse(baseValidData)).toEqual(baseValidData);
    });

    test.each(missingPropertiesToTest)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = {...baseValidData};
        delete dataWithoutProperty[property];
        expect(() => settingsSchema.parse(dataWithoutProperty)).toThrow();
    });


    // apiProvider
    test('should throw an error if apiProvider is not one of the enum values', () => {
        const dataWithInvalidApiProvider = {...baseValidData, apiProvider: 'invalidProvider'};
        expect(() => settingsSchema.parse(dataWithInvalidApiProvider)).toThrow();
    });

    test.each(['azure', 'openai'])('should validate successfully with apiProvider set to %s', (apiProvider) => {
        const dataWithValidApiProvider = {...baseValidData, apiProvider};
        expect(settingsSchema.parse(dataWithValidApiProvider)).toEqual(dataWithValidApiProvider);
    });

    // delay
    test('should throw an error if delay is not an int', () => {
        const dataWithInvalidDelay = {...baseValidData, delay: 0.5};
        expect(() => settingsSchema.parse(dataWithInvalidDelay)).toThrow();
    });

    test('should throw an error if delay is less than 0', () => {
        const dataWithInvalidDelay = {...baseValidData, delay: -1};
        expect(() => settingsSchema.parse(dataWithInvalidDelay)).toThrow();
    });

    test('should throw an error if delay is more than 2000', () => {
        const dataWithInvalidDelay = {...baseValidData, delay: 2001};
        expect(() => settingsSchema.parse(dataWithInvalidDelay)).toThrow();
    });

    // systemMessage
    test('should throw an error if systemMessage is less than 3 characters', () => {
        const dataWithShortSystemMessage = {...baseValidData, systemMessage: 'Hi'};
        expect(() => settingsSchema.parse(dataWithShortSystemMessage)).toThrow();
    });

    // userMessageTemplate
    test('should throw an error if userMessageTemplate is less than 3 characters', () => {
        const dataWithShortUserMessageTemplate = {...baseValidData, userMessageTemplate: 'Hi'};
        expect(() => settingsSchema.parse(dataWithShortUserMessageTemplate)).toThrow();
    });

    // maxPrefixCharLimit
    test('should throw an error if maxPrefixCharLimit is not an int.', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxPrefixCharLimit: 100.5};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    test('should throw an error if maxPrefixCharLimit is less than 100', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxPrefixCharLimit: 99};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    test('should throw an error if maxPrefixCharLimit is more than 10000', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxPrefixCharLimit: 10001};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    // maxSuffixCharLimit
    test('should throw an error if maxSuffixCharLimit is not an int.', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxSuffixCharLimit: 100.5};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    test('should throw an error if maxSuffixCharLimit is less than 100', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxSuffixCharLimit: 99};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    test('should throw an error if maxSuffixCharLimit is more than 10000', () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, maxSuffixCharLimit: 10001};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });

    test("should throw an error if chainOfThoughtRemovalRegex is an invalid regex", () => {
        const dataWithInvalidMaxPrefix = {...baseValidData, chainOfThoughRemovalRegex: '[A-Z'};
        expect(() => settingsSchema.parse(dataWithInvalidMaxPrefix)).toThrow();
    });
});

describe('smoketest', () => {

    test('frozen v1 json is still parsable', () => {
        const filePath = path.join(__dirname, 'settings_v1.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        const result = parseWithSchema(pluginDataSchema, data);

        expect(result).toEqual(ok(data));
    });

    test("default settings should be valid", () => {
        expect(settingsSchema.safeParse(DEFAULT_SETTINGS).success).toEqual(true);
    });
});
