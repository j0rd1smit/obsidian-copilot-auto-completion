import {
    ApiClient,
    ChatMessage,
    PostProcessor,
    PredictionService,
    PreProcessor,
    UserMessageFormatter,
    UserMessageFormattingInputs,
} from "../types";

import * as Handlebars from "handlebars";

import Context from "../../context_detection";
import RemoveCodeIndicators from "../post_processors/remove_code_indicators";
import RemoveMathIndicators from "../post_processors/remove_math_indicators";
import DataViewRemover from "../pre_processors/data_view_remover";
import LengthLimiter from "../pre_processors/length_limiter";
import OpenAIApiClient from "../api_clients/OpenAIApiClient";
import AzureOAIClient from "../api_clients/AzureOAIClient";
import RemoveOverlap from "../post_processors/remove_overlap";
import {FewShotExample, Settings} from "../../settings/versions";
import RemoveWhitespace from "../post_processors/remove_whitespace";
import OllamaApiClient from "../api_clients/OllamaApiClient";
import {err, ok, Result} from "neverthrow";

class ChatGPTWithReasoning implements PredictionService {
    private readonly client: ApiClient;

    private readonly systemMessage: string;
    private readonly userMessageFormatter: UserMessageFormatter;
    private readonly removePreAnswerGenerationRegex: string;
    private readonly preProcessors: PreProcessor[];
    private readonly postProcessors: PostProcessor[];
    private readonly fewShotExamples: FewShotExample[];

    private constructor(
        client: ApiClient,
        systemMessage: string,
        userMessageFormatter: UserMessageFormatter,
        removePreAnswerGenerationRegex: string,
        preProcessors: PreProcessor[],
        postProcessors: PostProcessor[],
        fewShotExamples: FewShotExample[]
    ) {
        this.client = client;
        this.systemMessage = systemMessage;
        this.userMessageFormatter = userMessageFormatter;
        this.removePreAnswerGenerationRegex = removePreAnswerGenerationRegex;
        this.preProcessors = preProcessors;
        this.postProcessors = postProcessors;
        this.fewShotExamples = fewShotExamples;
    }

    public static fromSettings(settings: Settings): PredictionService {
        const formatter = Handlebars.compile<UserMessageFormattingInputs>(
            settings.userMessageTemplate,
            {noEscape: true, strict: true}
        );
        const preProcessors: PreProcessor[] = [];
        if (settings.dontIncludeDataviews) {
            preProcessors.push(new DataViewRemover());
        }
        preProcessors.push(
            new LengthLimiter(
                settings.maxPrefixCharLimit,
                settings.maxSuffixCharLimit
            )
        );

        const postProcessors: PostProcessor[] = [];
        if (settings.removeDuplicateMathBlockIndicator) {
            postProcessors.push(new RemoveMathIndicators());
        }
        if (settings.removeDuplicateCodeBlockIndicator) {
            postProcessors.push(new RemoveCodeIndicators());
        }

        postProcessors.push(new RemoveOverlap());
        postProcessors.push(new RemoveWhitespace());

        let client: ApiClient;
        if (settings.apiProvider === "openai") {
            client = OpenAIApiClient.fromSettings(settings);
        } else if (settings.apiProvider === "azure") {
            client = AzureOAIClient.fromSettings(settings);
        } else if (settings.apiProvider === "ollama") {
            client = OllamaApiClient.fromSettings(settings);
        } else {
            throw new Error("Invalid API provider");
        }

        return new ChatGPTWithReasoning(
            client,
            settings.systemMessage,
            formatter,
            settings.chainOfThoughRemovalRegex,
            preProcessors,
            postProcessors,
            settings.fewShotExamples
        );
    }

    async fetchPredictions(
        prefix: string,
        suffix: string
    ): Promise<Result<string, Error>> {
        const context: Context = Context.getContext(prefix, suffix);

        for (const preProcessor of this.preProcessors) {
            if (preProcessor.removesCursor(prefix, suffix)) {
                return ok("");
            }

            ({prefix, suffix} = preProcessor.process(
                prefix,
                suffix,
                context
            ));
        }

        const examples = this.fewShotExamples.filter(
            (example) => example.context === context
        );
        const fewShotExamplesChatMessages =
            fewShotExamplesToChatMessages(examples);

        const messages: ChatMessage[] = [
            {content: this.systemMessage, role: "system"},
            ...fewShotExamplesChatMessages,
            {
                role: "user",
                content: this.userMessageFormatter({
                    suffix,
                    prefix,
                }),
            },
        ];

        let result = await this.client.queryChatModel(messages);
        result = this.extractAnswerFromChainOfThoughts(result);


        for (const postProcessor of this.postProcessors) {
            result = result.map((r) => postProcessor.process(prefix, suffix, r, context));
        }

        result = this.checkAgainstGuardRails(result);

        return result;
    }

    private extractAnswerFromChainOfThoughts(
        result: Result<string, Error>
    ): Result<string, Error> {
        if (result.isErr()) {
            return result;
        }
        const chainOfThoughts = result.value;

        const regex = new RegExp(this.removePreAnswerGenerationRegex, "gm");
        const match = regex.exec(chainOfThoughts);
        if (match === null) {
            return err(new Error("No match found"));
        }
        return ok(chainOfThoughts.replace(regex, ""));
    }

    private checkAgainstGuardRails(
        result: Result<string, Error>
    ): Result<string, Error> {
        if (result.isErr()) {
            return result;
        }
        if (result.value.length === 0) {
            return err(new Error("Empty result"));
        }
        if (result.value.contains("<mask/>")) {
            return err(new Error("Mask in result"));
        }

        return result;
    }
}

function fewShotExamplesToChatMessages(
    examples: FewShotExample[]
): ChatMessage[] {
    return examples
        .map((example): ChatMessage[] => {
            return [
                {
                    role: "user",
                    content: example.input,
                },
                {
                    role: "assistant",
                    content: example.answer,
                },
            ];
        })
        .flat();
}

export default ChatGPTWithReasoning;
