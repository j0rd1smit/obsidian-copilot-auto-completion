import {describe, expect, test} from "@jest/globals";
import {z} from "zod";
import {deserializeSettings, fixStructureAndValueErrors} from "../../settings/utils";
import {ok} from "neverthrow";
import {DEFAULT_SETTINGS} from "../../settings/versions";


describe('fixStructureAndValueErrors', () => {
    const schema = z.object({
        name: z.string().min(3),
        age: z.number().int().min(0),
        active: z.boolean(),
    }).strict();

    const defaultValue = {
        name: "bob",
        age: 42,
        active: true,
    };

    test('should pass with valid input', () => {
        const value = {name: "valid", age: 10, active: false};
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok(value));
    });

    test('should add missing keys', () => {
        const value = {name: "valid"};
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue, ...value}));
    });

    test('should remove unrecognized keys', () => {
        const value = {...defaultValue, extraKey: "irrelevant", number: "invalid"};
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok(defaultValue));
    });

    test('should replace invalid values with defaults', () => {
        const value = {name: "Fred", age: -1, active: 'not a boolean'};
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue, name: "Fred"}));
    });

    test('should handle missing key and unrecognized keys', () => {
        const value = {
            name: "bob",
            age: 42,
            unknownKey: "irrelevant",
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue, name: value.name, age: value.age}));
    });

    test('should handle missing key and invalid key', () => {
        const value = {
            name: "bob",
            age: -1,
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue, name: value.name}));
    });

    test('should handle unrecognized keys and invalid key', () => {
        const value = {
            age: -1,
            unknownKey: "irrelevant",
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue}));
    });


    test('should handle null value', () => {
        const result = fixStructureAndValueErrors(schema, null, defaultValue);
        expect(result).toEqual(ok(defaultValue));
    });

    test('should handle undefined value', () => {
        const result = fixStructureAndValueErrors(schema, undefined, defaultValue);
        expect(result).toEqual(ok(defaultValue));
    });


});

describe('fixStructureAndValueErrors nested', () => {
    const schema = z.object({
        name: z.string().min(3),
        age: z.number().int().min(0),
        active: z.boolean(),
        profile: z.object({
            bio: z.string(),
            contact: z.object({
                email: z.string().email(),
                phone: z.string().optional(),
            }).strict(),
        }).strict(),
    }).strict();

    const defaultValue = {
        name: "bob",
        age: 42,
        active: true,
        profile: {
            bio: "Default bio",
            contact: {
                email: "default@example.com",
            },
        },
    };


    test('should handle nested missing keys', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            profile: {
                bio: "Nested bio",
                // contact is missing
            },
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            profile: {...defaultValue.profile, bio: "Nested bio"}
        }));
    });

    test('should handle nested unrecognized keys', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            profile: {
                bio: "Nested bio",
                contact: {
                    email: "alice@example.com",
                    extraKey: "extra value", // Unrecognized key
                },
            },
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            profile: {
                ...defaultValue.profile,
                bio: "Nested bio",
                contact: {...defaultValue.profile.contact, email: value.profile.contact.email}
            }
        }));
    });

    test('should handle nested invalid values', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            profile: {
                bio: "Nested bio",
                contact: {
                    email: "invalid email", // Invalid email
                },
            },
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            profile: {...defaultValue.profile, bio: "Nested bio"}
        }));
    });

    test('should handle combination of nested errors', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            profile: {
                bio: 123, // Invalid type for bio
                contact: {
                    extraKey: "extra value", // Unrecognized key
                },
            },
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({...defaultValue, name: "Alice", age: 30, active: true}));
    });
});

describe('fixStructureAndValueErrors array', () => {
    const schema = z.object({
        name: z.string().min(3),
        age: z.number().int().min(0),
        active: z.boolean(),
        contacts: z.array(z.object({
            email: z.string().email(),
            phone: z.string().regex(/^\d{10}$/),
        }).strict()),
    }).strict();

    const defaultValue = {
        name: "bob",
        age: 42,
        active: true,
        contacts: [
            {email: "default@example.com", phone: "1234567890"},
        ],
    };

    test('should replace entire array with default if an item has missing keys', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            contacts: [
                {email: "alice@example.com"},
            ],
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            // Entire contacts array is replaced with default
            contacts: defaultValue.contacts,
        }));
    });

    test('should replace entire array if array contains empty object', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            contacts: [
                {email: "alice@example.com"},
                {},
            ],
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            // Entire contacts array is replaced with default
            contacts: defaultValue.contacts,
        }));
    });

    test('should replace entire array with default if an item has unrecognized keys', () => {
        const value = {
            name: "Alice",
            age: 30,
            active: true,
            contacts: [
                {email: "alice@example.com", extraKey: "irrelevant"}, // Unrecognized key
            ],
        };
        const result = fixStructureAndValueErrors(schema, value, defaultValue);
        expect(result).toEqual(ok({
            ...defaultValue,
            name: "Alice",
            age: 30,
            active: true,
            // Entire contacts array is replaced with default
            contacts: defaultValue.contacts,
        }));
    });
});

describe("deserializeSettings", () => {
    test("should be able to parse the current default settings", () => {
        const result = deserializeSettings(DEFAULT_SETTINGS);
        expect(result.isOk()).toBe(true);
    });

    test("should be able to parse empty json", () => {
        const result = deserializeSettings({});
        expect(result.isOk()).toBe(true);
    });

    test("should be able to parse null", () => {
        const result = deserializeSettings(null);
        expect(result.isOk()).toBe(true);
    });

    test("should be able to parse undefined", () => {
        const result = deserializeSettings(undefined);
        expect(result.isOk()).toBe(true);
    });
});
