import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {Settings} from "../../settings/settings";
import {requestUrl} from "obsidian";

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
        const headers = {
            "Content-Type": "application/json",
            "api-key": this.apiKey,
        }

        const response = await requestUrl({
            url: this.url,
            method: "POST",
            body: JSON.stringify({messages, ...this.modelOptions}),
            headers,
            throw: true,
            contentType: "application/json",
        });

        const data = response.json;
        return data.choices[0].message.content;
    }

    async isConfiguredCorrectly(): Promise<boolean> {
        try {
            await this.queryChatModel([
                {content: "hello world", role: "user"},
            ]);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default AzureOAIClient;
