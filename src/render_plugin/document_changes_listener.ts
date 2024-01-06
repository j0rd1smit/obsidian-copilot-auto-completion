import {ViewPlugin, ViewUpdate} from "@codemirror/view";
import UserEvent from "./user_event";

export class DocumentChanges {
    private update: ViewUpdate;
    private previousPrefix: string;
    private previousSuffix: string;

    constructor(update: ViewUpdate, previousPrefix: string, previousSuffix: string) {
        this.update = update;
        this.previousPrefix = previousPrefix;
        this.previousSuffix = previousSuffix;
    }

    public isDocInFocus(): boolean {
        return this.update.view.hasFocus;
    }

    public hasUserTyped(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.INPUT_TYPE) || this.isTextAdded();
    }

    public hasUserUndone(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.UNDO);
    }

    public hasUserDeleted(): boolean {
        const userEvents = this.getUserEvents();
        return (
            userEvents.filter((event) => UserEvent.isDelete(event)).length > 0
        );
    }

    public hasDocChanged(): boolean {
        return (
            this.update.docChanged ||
            this.hasUserTyped() ||
            this.hasUserDeleted()
        );
    }

    public hasCursorMoved(): boolean {
        return this.getUserEvents().contains(UserEvent.CURSOR_MOVED);
    }

    public getUserEvents(): UserEvent[] {
        const userEvents: UserEvent[] = [];
        for (const transaction of this.update.transactions) {
            const event = UserEvent.fromTransaction(transaction);
            if (event) {
                userEvents.push(event);
            }
        }

        return userEvents;
    }

    isTextAdded(): boolean {
        return this.getAddedText().length > 0;
    }

    getAddedText(): string {
        let addedText = "";
        this.update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            addedText += inserted;
        });

        return addedText;
    }

    getPrefix(): string {
        return getPrefix(this.update);
    }

    getSuffix(): string {
        return getSuffix(this.update);
    }

    getAddedPrefixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined;
        }
        const updatedPrefix = this.getPrefix();
        if (updatedPrefix.length > this.previousPrefix.length) {
            return updatedPrefix.substring(this.previousPrefix.length);
        }
        return "";
    }

    getAddedSuffixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined;
        }

        const updatedSuffix = this.getSuffix();

        if (updatedSuffix.length > this.previousSuffix.length) {
            return updatedSuffix.substring(0, updatedSuffix.length - this.previousSuffix.length);
        }
        return "";
    }

    getRemovedPrefixText(): string | undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined
        }

        const updatedPrefix = this.getPrefix();
        if (updatedPrefix.length < this.previousPrefix.length) {
            return this.previousPrefix.substring(updatedPrefix.length);
        }
        return "";
    }

    getRemovedSuffixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined
        }

        const updatedSuffix = this.getSuffix();
        if (updatedSuffix.length < this.previousSuffix.length) {
            return this.previousSuffix.substring(0, this.previousSuffix.length - updatedSuffix.length);
        }
        return "";
    }
}

const DocumentChangesListener = (
    onDocumentChange: (documentChange: DocumentChanges) => Promise<void>
) =>
    ViewPlugin.fromClass(
        class FetchPlugin {
            private previousPrefix = "";
            private previousSuffix = "";

            async update(update: ViewUpdate) {
                await onDocumentChange(new DocumentChanges(update, this.previousPrefix, this.previousSuffix));
                this.previousPrefix = getPrefix(update);
                this.previousSuffix = getSuffix(update);
            }
        }
    );

function getPrefix(update: ViewUpdate): string {
    return update.state.doc.sliceString(0, getCursorLocation(update));
}

function getCursorLocation(update: ViewUpdate): number {
    return update.state.selection.main.head;
}

function getSuffix(update: ViewUpdate): string {
    return update.state.doc.sliceString(getCursorLocation(update));
}

export default DocumentChangesListener;
