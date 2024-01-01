import {describe, expect, test} from "@jest/globals";
import {z} from "zod";
import {cloneDeep, merge} from "lodash";
import {fixStructureAndValueErrors} from "../../settings/utils";

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
        expect(fixStructureAndValueErrors(userSchema, defaultValue, input)).toEqual(defaultValue);
    });

    test.each([
        {extra: "extra"},
        {hello: "world", "foo": "bar"},
    ])("can remove extra properties: %s", (extraProperties: object) => {
        const input = {...defaultValue, ...extraProperties};
        expect(fixStructureAndValueErrors(userSchema, defaultValue, input)).toEqual(defaultValue);
    });

    // TODO: Fix this test
    // test.each([
    //     {name: 123, age: 'invalid', active: 'not a boolean'},
    //     {name: null, age: null, active: null},
    //     {name: '', age: 30, active: true},
    //     {name: 'Default', age: -1, active: true},
    // ])('invalid data types and other validation issues throw errors: %s', (invalidInput) => {
    //     expect(() => repairStructure(userSchema, defaultValue, invalidInput)).toThrow(ZodError);
    // })


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
        expect(fixStructureAndValueErrors(nestedSchema, nestedDefaultValue, nestedInput)).toEqual(expected);
    });
});

// TODO
// describe('fixValueErrors', () => {
//     const userSchema = z.object({
//         name: z.string().min(3),
//         age: z.number().int().min(0),
//         active: z.boolean(),
//     }).strict();
//     const defaultUserValue = {name: 'Default', age: 30, active: true};
//
//     test("The entire array gets replaced if a single element is incorrect", () => {
//
//     });
//
//     test("Only the incorrect value if it is a property ", () => {
//
//     });
//
//     test.each([
//         ["boolean type has string value", {...defaultUserValue, active: 'not a boolean'}, defaultUserValue],
//         ["number type has string value", {...defaultUserValue, age: "Invalid"}, defaultUserValue],
//     ])("Incorrect types get replaced with original: %s", (_, input, expected) => {
//
//         const result = fixValueErrors(userSchema, defaultUserValue, input);
//
//         expect(result).toEqual(expected);
//     });
// });
