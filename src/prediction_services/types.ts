import Context from "../context_detection";
import {Result} from "neverthrow";

export interface PredictionService {
    fetchPredictions(
        prefix: string,
        suffix: string
    ): Promise<Result<string, Error>>;
}

export interface PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
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


export interface UserMessageFormattingInputs {
    prefix: string;
    suffix: string;
}

export type UserMessageFormatter = (
    inputs: UserMessageFormattingInputs
) => string;

export interface ApiClient {
    queryChatModel(messages: ChatMessage[]): Promise<Result<string, Error>>;
    checkIfConfiguredCorrectly(): Promise<string[]>;
}

export interface ModelOptions {
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    max_tokens: number;
}
