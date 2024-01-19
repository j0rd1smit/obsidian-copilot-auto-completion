import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {Settings} from "../../settings/versions";
import {makeAPIRequest} from "./utils";
import {Result} from "neverthrow";


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

    async queryChatModel(messages: ChatMessage[]): Promise<Result<string, Error>> {
        const headers = {
            "Content-Type": "application/json",
            "api-key": this.apiKey,
        }
        const body = {messages, ...this.modelOptions};
        const data = await makeAPIRequest(this.url, "POST", body, headers);
        return data.map((data) => data.choices[0].message.content);
    }


    async checkIfConfiguredCorrectly(): Promise<string[]> {
        const errors: string[] = [];

        if (!this.apiKey) {
            errors.push("API key is not set.");
        }
        if (!this.url) {
            errors.push("Azure OpenAI API url is not set.");
        }
        if (errors.length > 0) {
            // api check is not possible without passing previous checks so return early
            return errors;
        }

        const result = await this.queryChatModel([
            {content: "Say hello world and nothing else.", role: "user"},
        ]);

        if (result.isErr()) {
            errors.push(result.error.message);
        }
        return errors;
    }
}

export default AzureOAIClient;
