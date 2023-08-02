import * as React from "react";
import { DEFAULT_SETTINGS, Settings } from "./settings";
import TextSettingItem from "./components/TextSettingItem";
import { useState } from "react";
import { checkForErrors } from "./utils";
import SliderSettingsItem from "./components/SliderSettingsItem";

import TriggerSettings from "./components/TriggerSettings";
import SettingsItem from "./components/SettingsItem";
import CheckBoxSettingItem from "./components/CheckBoxSettingItem";
import FewShotExampleSettings from "./components/FewShotExampleSettings";
import ConnectivityCheck from "./components/ConnectivityCheck";
import DropDownSettingItem from "./components/DropDownSettingItem";
import { Notice } from "obsidian";

interface IProps {
    onSettingsChanged(settings: Settings): void;

    settings: Settings;
}

export default function SettingsView(props: IProps): React.JSX.Element {
    const [settings, _setSettings] = useState<Settings>(props.settings);
    const errors = checkForErrors(settings);

    React.useEffect(() => {
        _setSettings(props.settings);
    }, [props.settings]);

    const updateSettings = (update: Partial<Settings>) => {
        _setSettings((settings: Settings) => {
            const newSettings = { ...settings, ...update };
            props.onSettingsChanged(newSettings);
            return newSettings;
        });
    };
    const resetSettings = () => {
        const azureOAIApiSettings = {
            ...settings.azureOAIApiSettings,
        };
        const openAIApiSettings = {
            ...DEFAULT_SETTINGS.openAIApiSettings,
            key: settings.openAIApiSettings.key,
        };

        const newSettings: Settings = {
            ...DEFAULT_SETTINGS,
            apiProvider: settings.apiProvider,
            azureOAIApiSettings,
            openAIApiSettings,
            advancedMode: settings.advancedMode,
        };
        updateSettings(newSettings);
        new Notice("Factory reset complete.");
    };



    const renderAPISettings = () => {
        if (settings.apiProvider === "azure") {
            return (
                <>
                    <TextSettingItem
                        name={"Azure OAI API URL"}
                        description={
                            "The azure openai services API URL used in the requests."
                        }
                        placeholder={"Your API URL..."}
                        value={settings.azureOAIApiSettings.url}
                        errorMessage={errors.get("azureOAIApiSettings.url")}
                        setValue={(value: string) =>
                            updateSettings({
                                azureOAIApiSettings: {
                                    ...settings.azureOAIApiSettings,
                                    url: value,
                                },
                            })
                        }
                    />
                    <TextSettingItem
                        name={"Azure API key"}
                        description={
                            "The azure openai services API key used in the requests."
                        }
                        placeholder={"Your API key..."}
                        password
                        value={settings.azureOAIApiSettings.key}
                        errorMessage={errors.get("azureOAIApiSettings.key")}
                        setValue={(value: string) =>
                            updateSettings({
                                azureOAIApiSettings: {
                                    ...settings.azureOAIApiSettings,
                                    key: value,
                                },
                            })
                        }
                    />
                </>
            );
        }
        if (settings.apiProvider === "openai") {
            return (
                <>
                    <TextSettingItem
                        name={"OpenAI API URL"}
                        description={
                            "The URL used in the requests. For the openai API this is fixed."
                        }
                        placeholder={"Your API URL..."}
                        value={settings.openAIApiSettings.url}
                        errorMessage={errors.get("openAIApiSettings.url")}
                        disabled
                        setValue={(_: string) => {}}
                    />
                    <TextSettingItem
                        name={"OpenAI API key"}
                        description={"The API key used in the requests."}
                        placeholder={"Your API key..."}
                        password
                        value={settings.openAIApiSettings.key}
                        errorMessage={errors.get("openAIApiSettings.key")}
                        setValue={(value: string) =>
                            updateSettings({
                                openAIApiSettings: {
                                    ...settings.openAIApiSettings,
                                    key: value,
                                },
                            })
                        }
                    />
                    <DropDownSettingItem
                        name={"Model"}
                        description={
                            "The openai model that will be queried. At the moment only gpt-3.5-turbo is supported."
                        }
                        value={settings.openAIApiSettings.model}
                        setValue={(_: string) => {}}
                        options={{
                            "gpt-3.5-turbo": "gpt-3.5-turbo",
                        }}
                        errorMessage={errors.get("openAIApiSettings.model")}
                        disabled
                    />
                </>
            );
        }
    };

    return (
        <div>
            <h2>General</h2>
            <CheckBoxSettingItem
                name={"Enable"}
                description={
                    "If disabled, nothing will trigger the extension or can result in an API call."
                }
                enabled={settings.enabled}
                setEnabled={(value) => updateSettings({ enabled: value })}
            />
            <DropDownSettingItem
                name={"API provider"}
                description={
                    "The plugin support multiple API providers. Depending on the provider different settings are required."
                }
                value={settings.apiProvider}
                setValue={(value: string) => {
                    if (value === "openai" || value === "azure") {
                        updateSettings({ apiProvider: value });
                    }
                }}
                options={{
                    openai: "OpenAI API",
                    azure: "Azure OAI API",
                }}
                errorMessage={errors.get("apiProvider")}
            />

            <h2>API</h2>
            {renderAPISettings()}

            <ConnectivityCheck settings={settings} />

            <h2>Model Options</h2>
            <SliderSettingsItem
                name={"Temperature"}
                description={
                    "Controls randomness. Lower temperatures result in more repetitive and deterministic responses. Higher temperatures will result in more unexpected or creative responses."
                }
                value={settings.modelOptions.temperature}
                errorMessage={errors.get("modelOptions.temperature")}
                setValue={(value: number) =>
                    updateSettings({
                        modelOptions: {
                            ...settings.modelOptions,
                            temperature: value,
                        },
                    })
                }
                min={0}
                max={1}
                step={0.05}
            />
            <SliderSettingsItem
                name={"TopP"}
                description={
                    "Like the temperature. Lowering Top P will limit the model’s token selection to likelier tokens. Increasing Top P expand the models token selection with lower likelihood tokens."
                }
                value={settings.modelOptions.top_p}
                errorMessage={errors.get("modelOptions.top_p")}
                setValue={(value: number) =>
                    updateSettings({
                        modelOptions: {
                            ...settings.modelOptions,
                            top_p: value,
                        },
                    })
                }
                min={0}
                max={1}
                step={0.05}
            />
            <SliderSettingsItem
                name={"Frequency Penalty"}
                description={
                    "Reduce the chance of repeating a token proportionally based on how often it has appeared in the text so far. This decreases the likelihood of repeating the exact same text in a response."
                }
                value={settings.modelOptions.frequency_penalty}
                errorMessage={errors.get("modelOptions.frequency_penalty")}
                setValue={(value: number) =>
                    updateSettings({
                        modelOptions: {
                            ...settings.modelOptions,
                            frequency_penalty: value,
                        },
                    })
                }
                min={0}
                max={1}
                step={0.05}
            />
            <SliderSettingsItem
                name={"Presence Penalty"}
                description={
                    "Reduce the chance of repeating any token that has appeared in the text so far. This increases the likelihood of introducing new topics in a response."
                }
                value={settings.modelOptions.presence_penalty}
                errorMessage={errors.get("modelOptions.presence_penalty")}
                setValue={(value: number) =>
                    updateSettings({
                        modelOptions: {
                            ...settings.modelOptions,
                            presence_penalty: value,
                        },
                    })
                }
                min={0}
                max={1}
                step={0.05}
            />
            <SliderSettingsItem
                name={"Max Tokens"}
                description={
                    "The maximum number of tokens the model is allowed to generate. This includes the chain of thought tokens before the answer."
                }
                value={settings.modelOptions.max_tokens}
                errorMessage={errors.get("modelOptions.max_tokens")}
                setValue={(value: number) =>
                    updateSettings({
                        modelOptions: {
                            ...settings.modelOptions,
                            max_tokens: value,
                        },
                    })
                }
                min={200}
                max={3000}
                step={10}
            />

            <h2>Preprocessing</h2>
            <CheckBoxSettingItem
                name={"Don't include dataviews"}
                description={
                    "Dataview(js) blocks can be quite long, while not providing much value to the AI. Is this setting is enabled, dataview blocks will be removed prompt to reduce the number of tokens. This could save you some money in the long run."
                }
                enabled={settings.dontIncludeDataviews}
                setEnabled={(value) =>
                    updateSettings({ dontIncludeDataviews: value })
                }
            />
            <SliderSettingsItem
                name={"Maximum Prefix Length"}
                description={
                    "The maximum number of characters that will be included in the prefix. Larger value will increase the context for the completion, but it can also increase the cost or push you over the token limit."
                }
                value={settings.maxPrefixCharLimit}
                errorMessage={errors.get("maxPrefixCharLimit")}
                setValue={(value: number) =>
                    updateSettings({ maxPrefixCharLimit: value })
                }
                min={100}
                max={10_000}
                step={100}
                suffix={" chars"}
            />
            <SliderSettingsItem
                name={"Maximum Suffix Length"}
                description={
                    "The maximum number of characters that will be included in the suffix. Larger value will increase the context for the completion, but it can also increase the cost or push you over the token limit."
                }
                value={settings.maxSuffixCharLimit}
                errorMessage={errors.get("maxSuffixCharLimit")}
                setValue={(value: number) =>
                    updateSettings({ maxSuffixCharLimit: value })
                }
                min={100}
                max={10_000}
                step={100}
                suffix={" chars"}
            />
            <h2>Postprocessing</h2>
            <CheckBoxSettingItem
                name={"Auto remove duplicate mat block indicators"}
                description={
                    "The AI model might eagerly add a math block indicator ($), even though the cursor is already inside a math block. If this setting is enabled, the plugin will automatically remove these duplicate indicators from the completion."
                }
                enabled={settings.removeDuplicateMathBlockIndicator}
                setEnabled={(value) =>
                    updateSettings({ removeDuplicateMathBlockIndicator: value })
                }
            />
            <CheckBoxSettingItem
                name={"Auto remove duplicate mat block indicators"}
                description={
                    "The AI model might eagerly add a code block indicator (`), even though the cursor is already inside a code block. If this setting is enabled, the plugin will automatically remove these duplicate indicators from the completion."
                }
                enabled={settings.removeDuplicateCodeBlockIndicator}
                setEnabled={(value) =>
                    updateSettings({ removeDuplicateCodeBlockIndicator: value })
                }
            />

            <h2>Trigger</h2>
            <SliderSettingsItem
                name={"Delay"}
                description={
                    "Delay in ms between the last character typed and the completion request."
                }
                value={settings.delay}
                errorMessage={errors.get("delay")}
                setValue={(value: number) => updateSettings({ delay: value })}
                min={0}
                max={5000}
                step={100}
                suffix={"ms"}
            />
            <TriggerSettings
                name={"Trigger words"}
                description={
                    "Completions will be triggered if the text before the matches any of these words or characters. This can either be a direct string match or a regex match. When using a regex, make sure to include the end of line character ($)."
                }
                triggers={settings.triggers}
                setValues={(triggers) => updateSettings({ triggers })}
                errorMessage={errors.get("triggerWords")}
            />

            <h2>Danger zone</h2>
            <SettingsItem
                name={"Factory Reset"}
                description={
                    "Messed-up the settings? No worries, press this button! After that the plugin will go back to the default settings. The url and api key will remain unchanged."
                }
            >
                <button
                    aria-label="Reset to default settings"
                    onClick={resetSettings}
                >
                    Reset
                </button>
            </SettingsItem>
            <CheckBoxSettingItem
                name={"Advanced mode"}
                description={
                    "If you are familiar with prompt engineering, you can enable this setting to view the prompts generation and few shot examples settings. Disable this button will not reset your changes, use the factory reset button for that."
                }
                enabled={settings.advancedMode}
                setEnabled={(value) => updateSettings({ advancedMode: value })}
            />

            {settings.advancedMode && (
                <>
                    <h2>Advanced</h2>
                    <TextSettingItem
                        name={"Chain of thought removal regex"}
                        description={
                            "This regex is used to remove the chain of thought tokens from the generated answer. If it is not implemented correctly, the chain of thought tokens will be included in the suggested completion."
                        }
                        placeholder={"your regex..."}
                        value={settings.chainOfThoughRemovalRegex}
                        errorMessage={errors.get("chainOfThoughRemovalRegex")}
                        setValue={(value: string) =>
                            updateSettings({
                                chainOfThoughRemovalRegex: value,
                            })
                        }
                    />

                    <SettingsItem
                        name={"System Message"}
                        description={
                            "This is the system message that give the models all the context and instructions it needs to complete the answer generation tasks. You can edit this message to your liking. If you edit the chain of thought formatting, make sure to update the extract regex and examples accordingly."
                        }
                        display={"block"}
                        errorMessage={errors.get("systemMessage")}
                    >
                        <textarea
                            className="setting-item-text-area"
                            rows={10}
                            placeholder="Your system message..."
                            value={settings.systemMessage}
                            onChange={(e) =>
                                updateSettings({
                                    systemMessage: e.target.value,
                                })
                            }
                        />
                    </SettingsItem>

                    <SettingsItem
                        name={"User Message template"}
                        description={
                            "This template defines how the prefix and suffix are formatted to create the user message. You have access to two variable: {{prefix}} and {{suffix}}. If you edit this make sure to update the examples accordingly."
                        }
                        display={"block"}
                        errorMessage={errors.get("userMessageTemplate")}
                    >
                        <textarea
                            className="setting-item-text-area"
                            rows={3}
                            placeholder="{{prefix}}<mask/>{{suffix}}"
                            value={settings.userMessageTemplate}
                            onChange={(e) =>
                                updateSettings({
                                    userMessageTemplate: e.target.value,
                                })
                            }
                        />
                    </SettingsItem>
                    <FewShotExampleSettings
                        fewShotExamples={settings.fewShotExamples}
                        name={"Few Shot Examples"}
                        description={
                            "The model uses these examples to learn the expected answer format. Not all examples are sent at the same time. We only send the relevant examples, given the current cursor location. For example, the CodeBlock examples are only sent if the cursor is in a code block. If no special context is detected, we send the Text examples. Each context has a default of 2 examples, but you can add or remove examples if there is at least one per context. You can add more examples, but this will increase the inference costs."
                        }
                        setFewShotExamples={(value) =>
                            updateSettings({ fewShotExamples: value })
                        }
                        errorMessage={errors.get("fewShotExamples")}
                    />
                </>
            )}
        </div>
    );
}
