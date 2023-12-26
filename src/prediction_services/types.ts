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
    queryChatModel(messages: ChatMessage[]): Promise<string>;
    checkIfConfiguredCorrectly(): Promise<string[]>;
}
