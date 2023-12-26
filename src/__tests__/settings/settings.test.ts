import {describe, expect, test} from "@jest/globals";
import {
    azureOAIApiSettingsSchema,
    fewShotExampleSchema,
    modelOptionsSchema,
    openAIApiSettingsSchema,
    settingsSchema,
    triggerSchema
} from "../../settings/settings";
import {TypeOf} from 'zod';
import {cloneDeep} from "lodash";



describe('azureOAIApiSettingsSchema', () => {
    type AzureOAIApiSettingsSchemaType = TypeOf<typeof azureOAIApiSettingsSchema>;
    const baseData: AzureOAIApiSettingsSchemaType = {key: 'abc123', url: 'https://example.com'};
    const propertiesNames = Object.keys(azureOAIApiSettingsSchema.shape) as Array<keyof AzureOAIApiSettingsSchemaType>;

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => azureOAIApiSettingsSchema.parse(dataWithoutProperty)).toThrow();
    });

    test('successful parse', () => {
        expect(azureOAIApiSettingsSchema.parse(baseData)).toEqual(baseData);
    });

    test('invalid url fails', () => {
        const data = {key: 'abc123', url: 'not a url'};
        expect(() => azureOAIApiSettingsSchema.parse(data)).toThrow();
    });
});

describe('openAIApiSettingsSchema', () => {
    type OpenAIApiSettingsSchemaType = TypeOf<typeof openAIApiSettingsSchema>;
    const baseData: OpenAIApiSettingsSchemaType = {key: 'abc123', model: "model", url: 'https://example.com'};
    const propertiesNames = Object.keys(openAIApiSettingsSchema.shape) as Array<keyof OpenAIApiSettingsSchemaType>;

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => openAIApiSettingsSchema.parse(dataWithoutProperty)).toThrow();
    });

    test('successful parse', () => {
        expect(openAIApiSettingsSchema.parse(baseData)).toEqual(baseData);
    });

    test('invalid url fails', () => {
        const data = {key: 'abc123', url: 'not an url', model: "model",};
        expect(() => openAIApiSettingsSchema.parse(data)).toThrow();
    });
});

describe('triggerSchema', () => {
    type TriggerSchemaType = TypeOf<typeof triggerSchema>;
    const baseData: TriggerSchemaType = {type: 'string', value: 'example'};
    const propertiesNames = Object.keys(triggerSchema.shape) as Array<keyof TriggerSchemaType>;

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
        const validData = {type: 'regex', value: '\\d+'}; // A valid regex for digits
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
});

describe('modelOptionsSchema', () => {
    type ModelOptionsSchemaType = TypeOf<typeof modelOptionsSchema>;
    const baseData: ModelOptionsSchemaType = {
        temperature: 0.5,
        top_p: 0.7,
        frequency_penalty: 1,
        presence_penalty: 0.2,
        max_tokens: 150
    };
    const propertiesNames = Object.keys(modelOptionsSchema.shape) as Array<keyof ModelOptionsSchemaType>;

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => modelOptionsSchema.parse(dataWithoutProperty)).toThrow();
    });


    test('should validate successfully with all values in valid ranges', () => {
        expect(modelOptionsSchema.parse(baseData)).toEqual(baseData);
    });

    test('should throw an error with temperature below 0', () => {
        const invalidData = {
            ...baseData,
            temperature: -0.0001,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with temperature above 1', () => {
        const invalidData = {
            ...baseData,
            temperature: 1.01,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with top_p smaller than 0', () => {
        const invalidData = {
            ...baseData,
            top_p: -0.001,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with top_p above 1', () => {
        const invalidData = {
            ...baseData,
            top_p: 1.1,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with frequency_penalty below 0', () => {
        const invalidData = {
            ...baseData,
            frequency_penalty: -0.001,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with frequency_penalty above 2', () => {
        const invalidData = {
            ...baseData,
            frequency_penalty: 2.1,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with if max_tokens is not an int', () => {
        const invalidData = {
            ...baseData,
            max_tokens: 130.5,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error with max_tokens below 128', () => {
        const invalidData = {
            ...baseData,
            max_tokens: 127,
        };
        expect(() => modelOptionsSchema.parse(invalidData)).toThrow();
    });
});

describe('fewShotExampleSchema', () => {
    type FewShotExampleSchemaType = TypeOf<typeof fewShotExampleSchema>;
    const baseData: FewShotExampleSchemaType = {
        context: 'abc',
        input: 'def',
        answer: 'ghi',
    };
    const propertiesNames = Object.keys(fewShotExampleSchema.shape) as Array<keyof FewShotExampleSchemaType>;

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => fewShotExampleSchema.parse(dataWithoutProperty)).toThrow();
    });

    test('should validate successfully with all properties meeting minimum length', () => {
        expect(fewShotExampleSchema.parse(baseData)).toEqual(baseData);
    });

    test('should throw an error if context is less than 3 characters', () => {
        const invalidData = {...baseData, context: 'ab'};
        expect(() => fewShotExampleSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error if input is less than 3 characters', () => {
        const invalidData = {...baseData, input: 'gh'};
        expect(() => fewShotExampleSchema.parse(invalidData)).toThrow();
    });

    test('should throw an error if answer is less than 3 characters', () => {

        const invalidData = {...baseData, answer: 'gh'};
        expect(() => fewShotExampleSchema.parse(invalidData)).toThrow();
    });
});


describe('settingsSchema', () => {
    type SettingsType = TypeOf<typeof settingsSchema>;
    const validAzureSettings = azureOAIApiSettingsSchema.parse({key: 'abc123', url: 'https://example.com'});
    const validOpenAISettings = openAIApiSettingsSchema.parse({
        key: 'abc123',
        url: 'https://example.com',
        model: 'gpt-3'
    });
    const validTrigger = triggerSchema.parse({type: 'string', value: '# '});
    const validModelOptions = modelOptionsSchema.parse({
        temperature: 0.5,
        top_p: 0.7,
        frequency_penalty: 1,
        presence_penalty: 0.2,
        max_tokens: 150
    });
    const validFewShotExample = fewShotExampleSchema.parse({context: 'abc', input: 'def', answer: 'ghi'});

    const baseValidData: SettingsType = {
        enabled: true,
        advancedMode: false,
        apiProvider: 'azure',
        azureOAIApiSettings: validAzureSettings,
        openAIApiSettings: validOpenAISettings,
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
        removeDuplicateMathBlockIndicator: true,
        removeDuplicateCodeBlockIndicator: true
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
});
