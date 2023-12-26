import {z} from 'zod';

export const MIN_DELAY = 0;
export const MAX_DELAY = 2000;
export const MIN_MAX_CHAR_LIMIT = 100;
export const MAX_MAX_CHAR_LIMIT = 10000;
export const MIN_MAX_TOKENS = 128;
export const MAX_MAX_TOKENS = 8192;
export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 1;
export const MIN_TOP_P = 0;
export const MAX_TOP_P = 1;
export const MIN_FREQUENCY_PENALTY = 0;
export const MAX_FREQUENCY_PENALTY = 2;
export const MIN_PRESENCE_PENALTY = 0;
export const MAX_PRESENCE_PENALTY = 2;

// Define schemas for each nested object
export const azureOAIApiSettingsSchema = z.object({
    key: z.string(),
    url: z.string().url(),
}).strict();

export const openAIApiSettingsSchema = z.object({
    key: z.string(),
    url: z.string().url(),
    model: z.string(),
}).strict();


export const triggerSchema = z.object({
    type: z.enum(['string', 'regex']),
    value: z.string(),
}).strict().superRefine((trigger, ctx) => {
    if (trigger.type === "regex") {
        if (!trigger.value.endsWith("$")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Regex triggers must end with a $.",
                path: ["value"],
            });
        }
    }
});

export const modelOptionsSchema = z.object({
    temperature: z.number()
        .min(0, {message: `Temperature must be at least ${MIN_TEMPERATURE}`})
        .max(1, {message: `Temperature must be at most ${MAX_TEMPERATURE}`}),
    top_p: z.number()
        .min(0, {message: `top_p must be greater than ${MIN_TOP_P}`})
        .max(1, {message: `top_p must be at most ${MAX_TOP_P}`}),
    frequency_penalty: z.number()
        .min(0, {message: `Frequency penalty must be at least ${MIN_FREQUENCY_PENALTY}`})
        .max(2, {message: `Frequency penalty must be at most ${MAX_FREQUENCY_PENALTY}`}),
    presence_penalty: z.number().min(MIN_PRESENCE_PENALTY, {message: `Presence penalty must be at least ${MIN_PRESENCE_PENALTY}`}).max(MAX_PRESENCE_PENALTY, {message: `Presence penalty must be at most ${MAX_PRESENCE_PENALTY}`}),
    max_tokens: z.number().int()
        .min(MIN_MAX_TOKENS, {message: `max_tokens must be at least than ${MIN_MAX_TOKENS}`}).max(MAX_MAX_TOKENS, {message: `max_tokens must be at most ${MAX_MAX_TOKENS}`}),
}).strict();

export const fewShotExampleSchema = z.object({
    // TODO: figure out how to make this compatible with the context enum and its namespace.
    context: z.enum(["Text", "Heading", "BlockQuotes", "UnorderedList", "NumberedList", "CodeBlock", "MathBlock", "TaskList"]),
    input: z.string().min(3, {message: "The Input must be at least 3 characters long"}),
    answer: z.string().min(3, {message: "The Answer must be at least 3 characters long"}),
}).strict();

// Define the main settings schema
export const settingsSchema = z.object({
    enabled: z.boolean(),
    advancedMode: z.boolean(),
    apiProvider: z.enum(['azure', 'openai']),
    azureOAIApiSettings: azureOAIApiSettingsSchema,
    openAIApiSettings: openAIApiSettingsSchema,
    triggers: z.array(triggerSchema),
    delay: z.number().int().min(MIN_DELAY, {message: "Delay must be between 0ms and 2000ms"}).max(MAX_DELAY, {message: "Delay must be between 0ms and 2000ms"}),
    modelOptions: modelOptionsSchema,
    systemMessage: z.string().min(3, {message: "System message must be at least 3 characters long"}),
    fewShotExamples: z.array(fewShotExampleSchema),
    userMessageTemplate: z.string().min(3, {message: "User message template must be at least 3 characters long"}),
    chainOfThoughRemovalRegex: z.string(),
    dontIncludeDataviews: z.boolean(),
    // TODO: see if we can replace this with tokens in the future.
    maxPrefixCharLimit: z.number().int().min(MIN_MAX_CHAR_LIMIT, {message: `Max prefix char limit must be at least ${MIN_MAX_CHAR_LIMIT}`}).max(MAX_MAX_CHAR_LIMIT, {message: `Max prefix char limit must be at most ${MAX_MAX_CHAR_LIMIT}`}),
    maxSuffixCharLimit: z.number().int().min(MIN_MAX_CHAR_LIMIT, {message: `Max prefix char limit must be at least ${MIN_MAX_CHAR_LIMIT}`}).max(MAX_MAX_CHAR_LIMIT, {message: `Max prefix char limit must be at most ${MAX_MAX_CHAR_LIMIT}`}),
    removeDuplicateMathBlockIndicator: z.boolean(),
    removeDuplicateCodeBlockIndicator: z.boolean()
}).strict();

export const storedDataSchema = z.object({
    settings: settingsSchema
}).strict();


export type Settings = z.infer<typeof settingsSchema>;
export type FewShotExample = z.infer<typeof fewShotExampleSchema>;
export type ModelOptions = z.infer<typeof modelOptionsSchema>;
export type Trigger = z.infer<typeof triggerSchema>;
export type StoredData = z.infer<typeof storedDataSchema>;
