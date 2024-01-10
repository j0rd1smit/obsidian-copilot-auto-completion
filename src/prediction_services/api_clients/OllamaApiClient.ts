import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {requestUrl} from "obsidian";
import {Settings} from "../../settings/versions";



class OllamaApiClient implements ApiClient {
    private readonly url: string;
    private readonly modelOptions: ModelOptions;
    private readonly model: string;

    static fromSettings(settings: Settings): OllamaApiClient {
        return new OllamaApiClient(
            settings.ollamaApiSettings.url,
            settings.ollamaApiSettings.model,
            settings.modelOptions,
        );
    }

    constructor(
        url: string,
        model: string,
        modelOptions: ModelOptions
    ) {
        this.url = url;
        this.modelOptions = modelOptions;
        this.model = model;
    }

    async queryChatModel(messages: ChatMessage[]): Promise<string> {
        const headers = {
            "Content-Type": "application/json",
        };

        const body = {
            messages,
            stream: false,
            model: this.model,
            options: {
                temperature: this.modelOptions.temperature,
                top_p: this.modelOptions.top_p,
            }
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
        return data.message.content;
    }

    async checkIfConfiguredCorrectly(): Promise<string[]> {
        const errors: string[] = [];
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

export default OllamaApiClient;
