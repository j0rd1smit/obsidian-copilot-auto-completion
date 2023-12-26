import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {SettingsTab} from "../../settings/SettingsTab";
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

    static fromSettings(settings: SettingsTab): ApiClient {
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
            throw: false,
            contentType: "application/json",
        });

        if (response.status >= 500) {
            throw new Error("Azure OpenAI API returned status code 500. Please try again later.");
        }

        if (response.status >= 400) {
            let errorMessage = `Azure OpenAI API returned status code ${response.status}`;
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
            errors.push("OpenAI API key is not set.");
        }
        if (!this.url) {
            errors.push("OpenAI API url is not set.");
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

export default AzureOAIClient;
