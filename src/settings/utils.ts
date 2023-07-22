import { Settings } from "./settings";
import { FewShotExample } from "../prediction_services/types";
import Context from "../context_detection";

export function checkForErrors(settings: Settings) {
    const errors = new Map<string, string>();

    const apiProviderOptions = ["azure", "openai"];
    if (!apiProviderOptions.contains(settings.apiProvider)) {
        const options = apiProviderOptions.join(", ");
        const message = `The API provider '${settings.apiProvider}' is invalid! Select one of the following: ${options}`;
        errors.set("apiProvider", message);
    }
    if (
        settings.apiProvider === "azure" &&
        !isValidUrl(settings.azureOAIApiSettings.url)
    ) {
        errors.set(
            "azureOAIApiSettings.url",
            "The URL does not have a valid format!"
        );
    }
    if (
        settings.apiProvider === "azure" &&
        settings.azureOAIApiSettings.key.length === 0
    ) {
        errors.set("azureOAIApiSettings.key", "The API key cannot be empty!");
    }

    if (
        settings.apiProvider === "openai" &&
        !isValidUrl(settings.openAIApiSettings.url)
    ) {
        errors.set(
            "openAIApiSettings.url",
            "The URL does not have a valid format!"
        );
    }
    if (
        settings.apiProvider === "openai" &&
        settings.openAIApiSettings.key.length === 0
    ) {
        errors.set("openAIApiSettings.key", "The API key cannot be empty!");
    }

    const openaiModelOptions = ["gpt-3.5-turbo"];
    if (
        settings.apiProvider === "openai" &&
        !openaiModelOptions.contains(settings.openAIApiSettings.model)
    ) {
        const options = openaiModelOptions.join(", ");
        const message = `The model '${settings.openAIApiSettings.model}' is invalid! Select one of the following: ${options}`;
        errors.set("openAIApiSettings.model", message);
    }

    if (
        settings.modelOptions.temperature < 0 ||
        settings.modelOptions.temperature > 1
    ) {
        errors.set(
            "modelOptions.temperature",
            "The temperature must be between 0 and 1!"
        );
    }
    if (settings.modelOptions.top_p < 0 || settings.modelOptions.top_p > 1) {
        errors.set("modelOptions.top_p", "The top p must be between 0 and 1!");
    }
    if (
        settings.modelOptions.frequency_penalty < 0 ||
        settings.modelOptions.frequency_penalty > 1
    ) {
        errors.set(
            "modelOptions.frequency_penalty",
            "The frequency penalty must be between 0 and 1!"
        );
    }
    if (
        settings.modelOptions.presence_penalty < 0 ||
        settings.modelOptions.presence_penalty > 1
    ) {
        errors.set(
            "modelOptions.presence_penalty",
            "The presence penalty must be between 0 and 1!"
        );
    }
    if (
        settings.modelOptions.max_tokens < 200 ||
        settings.modelOptions.max_tokens > 3000
    ) {
        errors.set(
            "modelOptions.max_tokens",
            "The max tokens must be between 200 and 3000!"
        );
    }

    if (
        settings.maxPrefixCharLimit < 200 ||
        settings.maxPrefixCharLimit > 10_000
    ) {
        errors.set(
            "maxPrefixCharLimit",
            "The max prefix char limit must be between 200 and 10000!"
        );
    }
    if (
        settings.maxSuffixCharLimit < 200 ||
        settings.maxSuffixCharLimit > 10_000
    ) {
        errors.set(
            "maxSuffixCharLimit",
            "The max suffix char limit must be between 200 and 10000!"
        );
    }
    if (settings.delay < 0 || settings.delay > 2000) {
        errors.set("delay", "The delay must be between 0 and 2000!");
    }
    if (settings.triggerWords.some((word) => word.length === 0)) {
        errors.set("triggerWords", "The trigger words cannot be empty!");
    }
    if (settings.triggerWords.length !== new Set(settings.triggerWords).size) {
        errors.set("triggerWords", "The trigger words cannot be duplicates!");
    }

    if (
        settings.chainOfThoughRemovalRegex.length === 0 ||
        !isValidRegex(settings.chainOfThoughRemovalRegex)
    ) {
        errors.set(
            "chainOfThoughRemovalRegex",
            "The chain of thought removal regex is invalid!"
        );
    }

    if (settings.systemMessage.length === 0) {
        errors.set("systemMessage", "The system message cannot be empty!");
    }

    if (!settings.userMessageTemplate.contains("{{prefix}}")) {
        errors.set(
            "userMessageTemplate",
            "The user message template must contain '{{prefix}}'!"
        );
    }
    if (settings.userMessageTemplate.length === 0) {
        errors.set(
            "userMessageTemplate",
            "The user message template cannot be empty!"
        );
    }

    if (!isEveryContextPresent(settings.fewShotExamples)) {
        errors.set("fewShotExamples", "Some contexts are empty!");
    }
    if (
        !settings.fewShotExamples.every((example) => example.context.length > 0)
    ) {
        errors.set("fewShotExamples", "Some contexts are empty!");
    }

    return errors;
}

function isValidRegex(regex: string) {
    try {
        new RegExp(regex, "gm");
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function isValidUrl(url: string) {
    const urlRegex =
        /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
    return urlRegex.test(url);
}

export function isEveryContextPresent(
    fewShotExamples: FewShotExample[]
): boolean {
    return Context.values().every((context) => {
        return fewShotExamples.some((example) => example.context === context);
    });
}
