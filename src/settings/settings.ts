import { z } from 'zod';

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
}).strict();


export const modelOptionsSchema = z.object({
  temperature: z.number()
    .min(0, { message: "Temperature must be at least 0" })
    .max(1, { message: "Temperature must be at most 1" }),
  top_p: z.number()
    .min(0, { message: "top_p must be greater than 0" }) // exclusive lower bound
    .max(1, { message: "top_p must be at most 1" }),
  frequency_penalty: z.number()
    .min(0, { message: "Frequency penalty must be at least 0" })
    .max(2, { message: "Frequency penalty must be at most 2" }),
  presence_penalty: z.number(),
  max_tokens: z.number().int()
    .min(128, { message: "max_tokens must be atleast than 128" }) // 129 is the minimum to be larger than 128
}).strict();

export const fewShotExampleSchema = z.object({
  context: z.string().min(3),
  input: z.string().min(3),
  answer: z.string().min(3),
}).strict();

// Define the main settings schema
export const settingsSchema = z.object({
  enabled: z.boolean(),
  advancedMode: z.boolean(),
  apiProvider: z.enum(['azure', 'openai']),
  azureOAIApiSettings: azureOAIApiSettingsSchema,
  openAIApiSettings: openAIApiSettingsSchema,
  triggers: z.array(triggerSchema),
  delay: z.number().int().min(0, {message:  "Delay must be between 0ms and 2000ms"}).max(2000, { message: "Delay must be between 0ms and 2000ms" }),
  modelOptions: modelOptionsSchema,
  systemMessage: z.string().min(3, { message: "System message must be at least 3 characters long" }),
  fewShotExamples: z.array(fewShotExampleSchema),
  userMessageTemplate: z.string().min(3, { message: "User message template must be at least 3 characters long" }),
  chainOfThoughRemovalRegex: z.string(),
  dontIncludeDataviews: z.boolean(),
  maxPrefixCharLimit: z.number().int().min(100, { message: "Max prefix char limit must be at least 0" }).max(10000, { message: "Max prefix char limit must be at most 10000" }),
  maxSuffixCharLimit: z.number().int().min(100, { message: "Max prefix char limit must be at least 0" }).max(10000, { message: "Max prefix char limit must be at most 10000" }),
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
