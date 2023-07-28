import { Settings } from "../../settings/settings";
import {
    ApiClient,
    ChatMessage,
    FewShotExample,
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
import RemoveWhiteSpacing from "../post_processors/remove_white_spacing";
import RemoveDuplicateDashes from "../post_processors/remove_dashes_spacing";
import RemoveOverlap from "../post_processors/remove_overlap";

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
            { noEscape: true, strict: true }
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

        const postProcessors: PostProcessor[] = [new RemoveOverlap(),new RemoveDuplicateDashes()];
        if (settings.removeDuplicateMathBlockIndicator) {
            postProcessors.push(new RemoveMathIndicators());
        }
        if (settings.removeDuplicateCodeBlockIndicator) {
            postProcessors.push(new RemoveCodeIndicators());
        }
        // TODO make this configurable
        postProcessors.push(new RemoveWhiteSpacing());

        let client: ApiClient;
        if (settings.apiProvider === "openai") {
            client = OpenAIApiClient.fromSettings(settings);
        } else if (settings.apiProvider === "azure") {
            client = AzureOAIClient.fromSettings(settings);
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
    ): Promise<string | undefined> {
        const context: Context = Context.getContext(prefix, suffix);

        for (const preProcessor of this.preProcessors) {
            if (preProcessor.removesCursor(prefix, suffix)) {
                return undefined;
            }

            ({ prefix, suffix } = preProcessor.process(
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
            { content: this.systemMessage, role: "system" },
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


        result = result.replace(
            new RegExp(this.removePreAnswerGenerationRegex, "gm"),
            ""
        );

        for (const postProcessor of this.postProcessors) {
            result = postProcessor.process(prefix, suffix, result, context);
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
