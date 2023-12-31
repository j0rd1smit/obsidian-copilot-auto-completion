import {Editor, MarkdownView, Notice, Plugin} from "obsidian";

import {DEFAULT_SETTINGS, Settings, SettingTab} from "./settings/settings";
import EventListener from "./event_listener";
import StatusBar from "./status_bar";
import DocumentChangesListener from "./render_plugin/document_changes_listener";
import {EditorView} from "@codemirror/view";
import RenderSuggestionPlugin from "./render_plugin/render_surgestion_plugin";
import {InlineSuggestionState} from "./render_plugin/states";
import CompletionKeyWatcher from "./render_plugin/completion_key_watcher";
import {hasSameAttributes} from "./settings/utils";

export default class CopilotPlugin extends Plugin {
    async onload() {
        const settings = await this.loadSettings();

        const settingsTab = await SettingTab.addSettingsTab(
            this,
            settings,
            this.saveSettings.bind(this)
        );
        const statusBar = StatusBar.fromApp(this);

        const eventListener = EventListener.fromSettings(
            settingsTab.settings,
            statusBar
        );
        settingsTab.addObserver(eventListener);
        this.registerEditorExtension([
            InlineSuggestionState,
            CompletionKeyWatcher(
                eventListener.handleAcceptKeyPressed.bind(eventListener),
                eventListener.handlePartialAcceptKeyPressed.bind(eventListener),
                eventListener.handleCancelKeyPressed.bind(eventListener)
            ),
            DocumentChangesListener(
                eventListener.handleDocumentChange.bind(eventListener)
            ),
            RenderSuggestionPlugin(),
        ]);

        this.app.workspace.onLayoutReady(() => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                // @ts-expect-error, not typed
                const editorView = view.editor.cm as EditorView;
                eventListener.onViewUpdate(editorView);
            }
        });
        this.app.workspace.on("active-leaf-change", (leaf) => {
            if (leaf?.view instanceof MarkdownView) {
                // @ts-expect-error, not typed
                const editorView = leaf.view.editor.cm as EditorView;
                eventListener.onViewUpdate(editorView);
            }
        });
        this.addCommand({
            id: "accept",
            name: "Accept",
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: MarkdownView
            ) => {
                if (checking) {
                    return (
                        settingsTab.settings.enabled &&
                        eventListener.isSuggesting()
                    );
                }

                eventListener.handleAcceptCommand();

                return true;
            },
        });

        this.addCommand({
            id: "predict",
            name: "Predict",
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: MarkdownView
            ) => {
                if (checking) {
                    return settingsTab.settings.enabled;
                }

                // @ts-expect-error, not typed
                const editorView = editor.cm as EditorView;
                // const editorView = view.editor.cm as EditorView;
                const cursorLocation = editorView.state.selection.main.head;
                const prefix = editorView.state.doc.sliceString(
                    0,
                    cursorLocation
                );
                const suffix = editorView.state.doc.sliceString(cursorLocation);

                eventListener.handlePredictCommand(prefix, suffix);
                return true;
            },
        });

        this.addCommand({
            id: "toggle",
            name: "Toggle",
            callback: () => {
                const newValue = !settingsTab.settings.enabled;
                settingsTab.setEnable(newValue);
            },
        });
        this.addCommand({
            id: "enable",
            name: "Enable",
            checkCallback: (checking) => {
                if (checking) {
                    return !settingsTab.settings.enabled;
                }

                settingsTab.setEnable(true);
                return true;
            },
        });
        this.addCommand({
            id: "disable",
            name: "Disable",
            checkCallback: (checking) => {
                if (checking) {
                    return settingsTab.settings.enabled;
                }

                settingsTab.setEnable(false);
                return true;
            },
        });

    }

    private async saveSettings(settings: Settings): Promise<void> {
        const data = {settings: settings};
        await this.saveData(data);
    }

    private async loadSettings(): Promise<Settings> {
        const data = Object.assign(
            {},
            {settings: DEFAULT_SETTINGS},
            await this.loadData()
        );
        const settings = data.settings;
        if (!hasSameAttributes(settings, DEFAULT_SETTINGS)) {
            new Notice("Copilot: Could not load settings, reverting to default settings");
            const azureOAIApiSettings = {
                ...settings.azureOAIApiSettings,
            };
            const openAIApiSettings = {
                ...DEFAULT_SETTINGS.openAIApiSettings,
                key: settings.openAIApiSettings.key,
            };

            const defaultSettings: Settings = {
                ...DEFAULT_SETTINGS,
                apiProvider: settings.apiProvider,
                azureOAIApiSettings,
                openAIApiSettings,
                advancedMode: settings.advancedMode,
            };
            return defaultSettings;
        }

        return settings;
    }

    onunload() {
    }
}
