import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {Settings} from "../../settings/settings";
import {requestUrl} from "obsidian";

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
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
        };
        const body = {
            messages,
            model: this.model,
            ...this.modelOptions,
        }

        const response = await requestUrl({
            url: this.url,
            method: "POST",
            body: JSON.stringify(body),
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

export default OpenAIApiClient;
