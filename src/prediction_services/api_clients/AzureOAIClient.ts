import { ApiClient, ChatMessage, ModelOptions } from "../types";
import { Settings } from "../../settings/settings";

class AzureOAIClient implements ApiClient {
    private readonly apiKey: string;
    private readonly url: string;
    private readonly modelOptions: ModelOptions;

    constructor(apiKey: string, url: string, modelOptions: ModelOptions) {
        this.apiKey = apiKey;
        this.url = url;
        this.modelOptions = modelOptions;
    }

    static fromSettings(settings: Settings): ApiClient {
        return new AzureOAIClient(
            settings.azureOAIApiSettings.key,
            settings.azureOAIApiSettings.url,
            settings.modelOptions
        );
    }

    async queryChatModel(messages: ChatMessage[]): Promise<string> {
        const response = await fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": this.apiKey,
            },
            body: JSON.stringify({ messages, ...this.modelOptions }),
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

export default AzureOAIClient;
