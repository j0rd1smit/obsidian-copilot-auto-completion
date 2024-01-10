import {ApiClient, ChatMessage, ModelOptions} from "../types";
import {Settings} from "../../settings/versions";
import {Result} from "neverthrow";
import {makeAPIRequest} from "./utils";


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

    async queryChatModel(messages: ChatMessage[]): Promise<Result<string, Error>> {
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

        const data = await makeAPIRequest(this.url, "POST", body, headers);
        if(data.isOk()) {
            console.log(data.value.message.content);
        }

        return data.map((data) => data.message.content);
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

        const result = await this.queryChatModel([
            {content: "hello world", role: "user"},
        ]);

        if (result.isErr()) {
            errors.push(result.error.message);
        }

        return errors;
    }
}

export default OllamaApiClient;
