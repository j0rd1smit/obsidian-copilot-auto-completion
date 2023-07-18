import Context from "../context_detection";

export interface PredictionService {
    fetchPredictions(
        prefix: string,
        suffix: string
    ): Promise<string | undefined>;
}

export interface PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string;
}

export interface PreProcessor {
    process(prefix: string, suffix: string, context: Context): PrefixAndSuffix;
    removesCursor(prefix: string, suffix: string): boolean;
}

export interface PrefixAndSuffix {
    prefix: string;
    suffix: string;
}

export interface ChatMessage {
    content: string;
    role: "user" | "assistant" | "system";
}

export interface ModelOptions {
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    max_tokens: number;
}

export interface UserMessageFormattingInputs {
    prefix: string;
    suffix: string;
}

export type UserMessageFormatter = (
    inputs: UserMessageFormattingInputs
) => string;

export interface FewShotExample {
    context: Context;
    input: string;
    answer: string;
}

export interface ApiClient {
    queryChatModel(messages: ChatMessage[]): Promise<string>;
    isConfiguredCorrectly(): Promise<boolean>;
}
