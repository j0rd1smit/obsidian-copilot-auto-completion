import { ApiClient, ChatMessage, ModelOptions } from "../types";
import { Settings } from "../../settings/settings";

class OpenAIApiClient implements ApiClient {
    private readonly apiKey: string;
    private readonly url: string;
    private readonly modelOptions: ModelOptions;
    private readonly model: string;

    static fromSettings(settings: Settings): OpenAIApiClient {
        return new OpenAIApiClient(
            settings.openAIApiSettings.key,
            settings.openAIApiSettings.url,
            settings.openAIApiSettings.model,
            settings.modelOptions
        );
    }
    constructor(
        apiKey: string,
        url: string,
        model: string,
        modelOptions: ModelOptions
    ) {
        this.apiKey = apiKey;
        this.url = url;
        this.modelOptions = modelOptions;
        this.model = model;
    }

    async queryChatModel(messages: ChatMessage[]): Promise<string> {
        const response = await fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                messages,
                model: this.model,
                ...this.modelOptions,
            }),
        });

        const data = await response.json();

        return data.choices[0].message.content;
    }

    async isConfiguredCorrectly(): Promise<boolean> {
        try {
            await this.queryChatModel([
                { content: "hello world", role: "user" },
            ]);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default OpenAIApiClient;
