import {Editor, MarkdownView, Notice, Plugin} from "obsidian";
import {SettingTab} from "./settings/SettingsTab";
import EventListener from "./event_listener";
import StatusBar from "./status_bar";
import DocumentChangesListener from "./render_plugin/document_changes_listener";
import {EditorView} from "@codemirror/view";
import RenderSuggestionPlugin from "./render_plugin/render_surgestion_plugin";
import {InlineSuggestionState} from "./render_plugin/states";
import CompletionKeyWatcher from "./render_plugin/completion_key_watcher";
import {DEFAULT_SETTINGS, Settings} from "./settings/versions";
import {deserializeSettings, serializeSettings} from "./settings/utils";


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
                eventListener.handlePartialUndoKeyPressed.bind(eventListener),
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
                eventListener.onViewUpdate(editorView, view.editor);
            }
        });
        this.app.workspace.on("active-leaf-change", (leaf) => {
            if (leaf?.view instanceof MarkdownView) {
                // @ts-expect-error, not typed
                const editorView = leaf.view.editor.cm as EditorView;
                eventListener.onViewUpdate(editorView, leaf.view.editor);
                eventListener.handleFilePathChange(leaf.view.file.path);
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
                    return eventListener.isIdle();
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
        const data = serializeSettings(settings);
        await this.saveData(data);
    }

    private async loadSettings(): Promise<Settings> {
        const data = await this.loadData();
        const result = deserializeSettings(data);
        if (result.isOk()) {
            return result.value;
        } else {
            new Notice("Copilot: Could not load settings, reverting to default settings");
            console.error(result.error);
            return DEFAULT_SETTINGS
        }
    }

    onunload() {
    }
}


