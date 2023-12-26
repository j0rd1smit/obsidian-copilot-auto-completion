import {ApiClient, ChatMessage} from "../types";
import {requestUrl} from "obsidian";
import {Settings, ModelOptions} from "../../settings/settings";

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
            throw: false,
            contentType: "application/json",
        });

        if (response.status >= 500) {
            throw new Error("OpenAI API returned status code 500. Please try again later.");
        }

        if (response.status >= 400) {
            let errorMessage = `OpenAI API returned status code ${response.status}`;
            if (response.json && response.json.error && response.json.error.message) {
                errorMessage += `: ${response.json.error.message}`;
            }
            throw new Error(errorMessage);
        }

        const data = response.json;

        return data.choices[0].message.content;
    }

    async checkIfConfiguredCorrectly(): Promise<string[]> {
        const errors: string[] = [];
        if (!this.apiKey) {
            errors.push("OpenAI API key is not set");
        }
        if (!this.url) {
            errors.push("OpenAI API url is not set");
        }
        if (errors.length > 0) {
            // api check is not possible without passing previous checks so return early
            return errors;
        }

        try {
            await this.queryChatModel([
                {content: "hello world", role: "user"},
            ]);
        } catch (e) {
            errors.push(e.message);
        }
        return errors;
    }
}

export default OpenAIApiClient;
