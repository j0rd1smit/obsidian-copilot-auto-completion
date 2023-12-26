import {Plugin, PluginSettingTab} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import SettingsView from "./SettingsView";
import * as React from "react";
import block_qoute_example from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/block_qoute_example";
import codeblock_function_completion
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/codeblock_function_completion";
import codeblock_function_parameters
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/codeblock_function_parameters";
import header_example from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/header_example";
import numbered_list_example
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/numbered_list_example";
import sub_task_list_example
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/sub_task_list_example";
import task_list_example from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/task_list_example";
import text_completion_end from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/text_completion_end";
import text_completion_middle
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/text_completion_middle";
import unordered_list_pro_and_con_list
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/unordered_list_pro_and_con_list";
import unordered_list_solid
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/unordered_list_solid";
import math_block_inline from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/math_block_inline";
import math_block_multi_line
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/math_block_multi_line";
import header_example_relu
    from "../prediction_services/chat_gpt_with_reasoning/few_shot_examples/header_example_relu";
import {Settings} from "./settings";



export const DEFAULT_SETTINGS: Settings = {
    // General settings
    enabled: true,
    advancedMode: false,
    apiProvider: "openai",
    // API settings
    azureOAIApiSettings: {
        key: "",
        url: "",
    },
    openAIApiSettings: {
        key: "",
        url: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
    },

    // Trigger settings
    triggers: [
        {type: "string", value: "# "},
        {type: "string", value: ". "},
        {type: "string", value: ": "},
        {type: "string", value: ", "},
        {type: "string", value: "! "},
        {type: "string", value: "? "},
        {type: "string", value: "`"},
        {type: "string", value: "' "},
        {type: "string", value: "= "},
        {type: "string", value: "$ "},
        {type: "string", value: "\n"},

        // bullet list
        {type: "regex", value: "[\\t ]*(\\-|\\*)[\\t ]+$"},
        // numbered list
        {type: "regex", value: "[\\t ]*[0-9A-Za-z]+\\.[\\t ]+$"},
        // new line with spaces
        {type: "regex", value: "\\$\\$\\n[\\t ]*$"},
        // markdown multiline code block
        {type: "regex", value: "```[a-zA-Z0-9]*(\\n\\s*)?$"},
        // task list normal, sub or numbered.
        {type: "regex", value: "\\s*(-|[0-9]+\\.) \\[.\\]\\s+$"},
    ],


    delay: 1000,
    // Request settings
    modelOptions: {
        temperature: 1,
        top_p: 0.1,
        frequency_penalty: 0.25,
        presence_penalty: 0,
        max_tokens: 800,
    },
    // Prompt settings
    systemMessage: `Your job is to predict the most logical text that should be written at the location of the <mask/>.
Your answer can be either code, a single word, or multiple sentences.
Your answer must be in the same language as the text that is already there.
Your response must have the following format:
THOUGHT: here you explain your reasoning of what could be at the location of <mask/>
ANSWER: here you write the text that should be at the location of <mask/>
`,
    fewShotExamples: [
        block_qoute_example,
        codeblock_function_completion,
        codeblock_function_parameters,
        header_example,
        numbered_list_example,
        sub_task_list_example,
        task_list_example,
        text_completion_end,
        text_completion_middle,
        unordered_list_pro_and_con_list,
        unordered_list_solid,
        math_block_inline,
        math_block_multi_line,
        header_example_relu,
    ].sort((a, b) => a.toString().localeCompare(b.toString())),
    userMessageTemplate: "{{prefix}}<mask/>{{suffix}}",
    chainOfThoughRemovalRegex: `(.|\\n)*ANSWER:`,
    // Preprocessing settings
    dontIncludeDataviews: true,
    maxPrefixCharLimit: 2000,
    maxSuffixCharLimit: 2000,
    // Postprocessing settings
    removeDuplicateMathBlockIndicator: true,
    removeDuplicateCodeBlockIndicator: true,
};

export interface SettingsObserver {
    handleSettingChanged(settings: Settings): void;
}

type SaveSettings = (settings: Settings) => Promise<void>;

export class SettingTab extends PluginSettingTab {
    public settings: Settings = DEFAULT_SETTINGS;
    private updatedSettings: Settings | undefined = undefined;
    private observers: SettingsObserver[] = [];
    private root: Root | undefined = undefined;
    private saveSettings: SaveSettings;

    public static addSettingsTab(
        plugin: Plugin,
        settings: Settings,
        saveSettings: SaveSettings
    ): SettingTab {
        const settingsTab = new SettingTab(plugin, settings, saveSettings);
        plugin.addSettingTab(settingsTab);

        return settingsTab;
    }

    public constructor(
        private plugin: Plugin,
        settings: Settings,
        saveSettings: SaveSettings
    ) {
        super(plugin.app, plugin);
        this.plugin = plugin;
        this.settings = settings;
        this.saveSettings = saveSettings;
    }

    public addObserver(observer: SettingsObserver): void {
        this.observers.push(observer);
    }

    public setEnable(enabled: boolean): void {
        this.settings = {...this.settings, enabled: enabled};
        this.saveSettings(this.settings).then(() => this.updateObservers());
    }

    private updateObservers(): void {
        for (const observer of this.observers) {
            observer.handleSettingChanged(this.settings);
        }
    }

    display(): void {
        this.root = createRoot(this.containerEl);

        this.root.render(
            <React.StrictMode>
                <SettingsView
                    onSettingsChanged={async (settings) => {
                        this.updatedSettings = settings;
                    }}
                    settings={this.settings}
                />
            </React.StrictMode>
        );

    }


    hide(): void {
        if (this.updatedSettings) {
            this.settings = this.updatedSettings;
            this.updatedSettings = undefined;
            this.saveSettings(this.settings).then(() => this.updateObservers());
        }
        if (this.root) {
            this.root.unmount();
        }
        super.hide();
    }
}
