import {ViewPlugin, ViewUpdate} from "@codemirror/view";
import UserEvent from "./user_event";
import {EditorState} from "@codemirror/state";

export class DocumentChanges {
    private update: ViewUpdate;

    constructor(update: ViewUpdate) {
        this.update = update;

    }

    public isDocInFocus(): boolean {
        return this.update.view.hasFocus;
    }

    public noUserEvents(): boolean {
        return this.getUserEvents().length === 0;
    }

    public hasUserTyped(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.INPUT_TYPE);
    }

    public hasUserUndone(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.UNDO);
    }

    public hasUserRedone(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.REDO);
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
        return getPrefix(this.update.state);
    }

    getSuffix(): string {
        return getSuffix(this.update.state);
    }

    getAddedPrefixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined;
        }

        const previousPrefix = this.getPreviousPrefix();
        const updatedPrefix = this.getPrefix();

        if (updatedPrefix.length > previousPrefix.length) {
            return updatedPrefix.substring(previousPrefix.length);
        }
        return "";
    }

    getPreviousPrefix(): string {
        return getPrefix(this.update.startState);
    }

    getAddedSuffixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined;
        }

        const previousSuffix = this.getPreviousSuffix();
        const updatedSuffix = this.getSuffix();

        if (updatedSuffix.length > previousSuffix.length) {
            return updatedSuffix.substring(0, updatedSuffix.length - previousSuffix.length);
        }
        return "";
    }

    getPreviousSuffix(): string {
        return getSuffix(this.update.startState);
    }

    getRemovedPrefixText(): string | undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined
        }

        const previousPrefix = this.getPreviousPrefix();
        const updatedPrefix = this.getPrefix();

        if (updatedPrefix.length < previousPrefix.length) {
            return previousPrefix.substring(updatedPrefix.length);
        }
        return "";
    }

    getRemovedSuffixText(): string|undefined {
        if (!this.isDocInFocus() || this.hasCursorMoved()) {
            return undefined
        }

        const previousSuffix = this.getPreviousSuffix();
        const updatedSuffix = this.getSuffix();

        if (updatedSuffix.length < previousSuffix.length) {
            return previousSuffix.substring(0, previousSuffix.length - updatedSuffix.length);
        }
        return "";
    }

    hasSelection(): boolean {
        return hasSelection(this.update.state);
    }

    hasMultipleCursors(): boolean {
        return hasMultipleCursors(this.update.state);
    }
}

const DocumentChangesListener = (
    onDocumentChange: (documentChange: DocumentChanges) => Promise<void>
) =>
    ViewPlugin.fromClass(
        class FetchPlugin {

            async update(update: ViewUpdate) {

                await onDocumentChange(new DocumentChanges(update));
            }
        }
    );

export function getPrefix(state: EditorState): string {
    return state.doc.sliceString(0, getCursorLocation(state));
}

export function getCursorLocation(state: EditorState): number {
    return state.selection.main.head;
}

export function getSuffix(state: EditorState): string {
    return state.doc.sliceString(getCursorLocation(state));
}

export function hasMultipleCursors(state: EditorState): boolean {
    return state.selection.ranges.length > 1;
}

export function hasSelection(state: EditorState): boolean {
    for (const range of state.selection.ranges) {
        const {from, to} = range;
        if (from !== to) {
            return true;
        }
    }
    return false;
}

export default DocumentChangesListener;
