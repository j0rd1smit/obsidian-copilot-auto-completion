import {describe, expect, test} from "@jest/globals";
import {TypeOf} from "zod";
import {cloneDeep} from "lodash";
import {
    azureOAIApiSettingsSchema,
    fewShotExampleSchema,
    modelOptionsSchema,
    ollamaApiSettingsSchema,
    openAIApiSettingsSchema,
} from "../../../settings/versions/shared";
import {findEqualPaths} from "../../../settings/utils";


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

describe('ollamaApiSettingsSchema', () => {
    type OllamaApiSettingsSchemaType = TypeOf<typeof ollamaApiSettingsSchema>;
    const baseData: OllamaApiSettingsSchemaType = {model: "model", url: 'http://localhost:11434/api/chat'};
    const propertiesNames = Object.keys(ollamaApiSettingsSchema.shape) as Array<keyof OllamaApiSettingsSchemaType>;

    test.each(propertiesNames)('should throw an error if %s is missing', (property) => {
        const dataWithoutProperty = cloneDeep(baseData);
        delete dataWithoutProperty[property];
        expect(() => ollamaApiSettingsSchema.parse(dataWithoutProperty)).toThrow();
    });

    test('successful parse', () => {
        expect(ollamaApiSettingsSchema.parse(baseData)).toEqual(baseData);
    });

    test('invalid url fails', () => {
        const data = {key: 'abc123', url: 'not an url', model: "model",};
        expect(() => ollamaApiSettingsSchema.parse(data)).toThrow();
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


describe('findEqualPaths', () => {
    test('should return empty array if no paths are equal', () => {
        const obj1 = {prop1: {prop2: 3}};
        const obj2 = {prop1: {prop2: 4}};
        expect(findEqualPaths(obj1, obj2)).toEqual([]);
    });

    test('should return correct paths for equal leaves', () => {
        const obj1 = {
            prop1: [{prop2: 5}, {prop3: 10}],
            prop3: 'value',
        };
        const obj2 = {
            prop1: [{prop2: 5}, {prop3: 20}],
            prop3: 'value',
        };
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1.[0].prop2', 'prop3']);
    });

    test('should handle nested objects', () => {
        const obj1 = {
            prop1: {nested: {prop2: 'hello'}},
            prop3: 'value',
        };
        const obj2 = {
            prop1: {nested: {prop2: 'hello'}},
            prop3: 'value',
        };
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1.nested.prop2', 'prop3']);
    });

    test('should handle arrays', () => {
        const obj1 = {prop1: ['a', 'b', 'c']};
        const obj2 = {prop1: ['a', 'x', 'c']};
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1.[0]', 'prop1.[2]']);
    });

    test('should handle different structures', () => {
        const obj1 = {prop1: 1, prop2: {nested: 2}};
        const obj2 = {prop1: 1, prop2: 2};
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1']);
    });

    test('should handle empty objects', () => {
        const obj1 = {};
        const obj2 = {};
        const obj3 = {prop1: 'value'};
        expect(findEqualPaths(obj1, obj2)).toEqual([]);
        expect(findEqualPaths(obj1, obj3)).toEqual([]);
    });

    test('should handle arrays of different lengths', () => {
        const obj1 = {prop1: ['a', 'b', 'c', 'd']};
        const obj2 = {prop1: ['a', 'b']};
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1.[0]', 'prop1.[1]']);
    });

    test('should handle objects with different keys', () => {
        const obj1 = {prop1: 'value', prop2: 'value2'};
        const obj2 = {prop3: 'value', prop4: 'value2'};
        expect(findEqualPaths(obj1, obj2)).toEqual([]);
    });

    test('should handle objects with arrays and nested objects', () => {
        const obj1 = {prop1: [{nested: {prop2: 'hello'}}]};
        const obj2 = {prop1: [{nested: {prop2: 'hello'}}]};
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1.[0].nested.prop2']);
    });

    test('should handle non-object values', () => {
        expect(findEqualPaths('hello', 'hello')).toEqual([]);
        expect(findEqualPaths(42, 42)).toEqual([]);
        expect(findEqualPaths(['a', 'b'], ['a', 'b'])).toEqual([]);
    });

    test('should handle null and undefined values', () => {
        const obj1 = {prop1: null, prop2: undefined};
        const obj2 = {prop1: null, prop2: 'defined'};
        expect(findEqualPaths(obj1, obj2)).toEqual(['prop1']);
    });

    test('should ignore functions', () => {
        const func = () => {
        };
        const obj1 = {prop1: func};
        const obj2 = {prop1: func};
        expect(findEqualPaths(obj1, obj2)).toEqual([]);
    });
});
