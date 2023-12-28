import {describe, expect, test} from "@jest/globals";
import {TypeOf, z, ZodError} from "zod";

import {cloneDeep, merge} from "lodash";
import {
    azureOAIApiSettingsSchema,
    openAIApiSettingsSchema,
    modelOptionsSchema,
    fewShotExampleSchema,
    repairStructure
} from "../../../settings/versions/shared";





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

    test("url can be empty", () => {
        const data = {key: 'abc123', url: ''};
        expect(azureOAIApiSettingsSchema.parse(data)).toEqual(data);
    });

    test('invalid url fails', () => {
        const data = {key: 'abc123', url: 'not a url'};
        expect(() => azureOAIApiSettingsSchema.parse(data)).toThrow();
    });
});

describe('fewShotExampleSchema', () => {
    type FewShotExampleSchemaType = TypeOf<typeof fewShotExampleSchema>;
    const baseData: FewShotExampleSchemaType = {
        context: 'Text',
        input: 'def',
        answer: 'ghi',
    };
    const propertiesNames = Object.keys(fewShotExampleSchema.shape) as Array<keyof FewShotExampleSchemaType>;
    const validContexts = ['Text', 'Heading', 'BlockQuotes', 'UnorderedList', 'NumberedList', 'CodeBlock', 'MathBlock', 'TaskList'];

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => fewShotExampleSchema.parse(dataWithoutProperty)).toThrow();
    });

    test.each(validContexts)('should validate successfully with context set to %s', (context) => {
        const validData = {...baseData, context};
        expect(fewShotExampleSchema.parse(validData)).toEqual(validData);
    });

    test('should validate successfully with all properties meeting minimum length', () => {
        expect(fewShotExampleSchema.parse(baseData)).toEqual(baseData);
    });

    test('should throw an error if context is invalid', () => {
        const invalidData = {...baseData, context: 'invalidContext'};
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

describe('repairStructure', () => {
    const userSchema = z.object({
        name: z.string().min(3),
        age: z.number().int().min(0),
        active: z.boolean(),
    }).strict();
    const defaultValue = {name: 'Default', age: 30, active: true};
    const propertyNames = Object.keys(userSchema.shape) as Array<keyof typeof defaultValue>;

    test.each(propertyNames)('can repair missing properties: %s', (property) => {
        const input = cloneDeep(defaultValue);
        delete input[property];
        expect(repairStructure(userSchema, defaultValue, input)).toEqual(defaultValue);
    });

    test.each([
        {extra: "extra"},
        {hello: "world", "foo": "bar"},
    ])("can remove extra properties: %s", (extraProperties: object) => {
        const input = {...defaultValue, ...extraProperties};
        expect(repairStructure(userSchema, defaultValue, input)).toEqual(defaultValue);
    });

    test.each([
        {name: 123, age: 'invalid', active: 'not a boolean'},
        {name: null, age: null, active: null},
        {name: '', age: 30, active: true},
        {name: 'Default', age: -1, active: true},
    ])('invalid data types and other validation issues throw errors: %s', (invalidInput) => {
        expect(() => repairStructure(userSchema, defaultValue, invalidInput)).toThrow(ZodError);
    })


    test('can handle nested structures', () => {

        const nestedSchema = z.object({
            settings: userSchema,
            otherSetting: z.number(),
        }).strict();

        const nestedDefaultValue = {
            settings: defaultValue,
            otherSetting: 1
        };

        const nestedInput = {settings: {name: 'Nested', age: 40}};
        const expected = merge({}, nestedDefaultValue, nestedInput);
        expect(repairStructure(nestedSchema, nestedDefaultValue, nestedInput)).toEqual(expected);
    });
});
