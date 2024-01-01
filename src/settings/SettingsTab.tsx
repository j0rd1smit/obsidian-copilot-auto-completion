import {Notice, Plugin, PluginSettingTab} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import SettingsView from "./SettingsView";
import * as React from "react";
import {DEFAULT_SETTINGS, Settings} from "./versions";
import {checkForErrors} from "./utils";


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

            const errors = checkForErrors(this.settings);
            if (errors.size > 0) {
                new Notice("Copilot: Cannot save your setting while there are errors");
            } else {
                this.saveSettings(this.settings).then(() => this.updateObservers());
            }
        }
        if (this.root) {
            this.root.unmount();
        }
        super.hide();
    }
}
