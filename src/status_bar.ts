import { Plugin } from "obsidian";

class StatusBar {
    private readonly statusBarItem: HTMLElement;
    private text = "";

    private constructor(statusBarItem: HTMLElement) {
        this.statusBarItem = statusBarItem;
    }

    public static fromApp(plugin: Plugin): StatusBar {
        const statusBarItem = plugin.addStatusBarItem();
        return new StatusBar(statusBarItem);
    }

    public render(): void {
        if (this.text.length === 0) {
            return;
        }
        this.statusBarItem.empty();
        this.statusBarItem.setText(this.text);
    }

    public updateText(text: string): void {
        this.text = text.trim();
        this.render();
    }
}

export default StatusBar;
