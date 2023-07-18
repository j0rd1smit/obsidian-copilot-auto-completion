import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import UserEvent from "./user_event";

export class DocumentChanges {
    private update: ViewUpdate;

    constructor(update: ViewUpdate) {
        this.update = update;
    }

    public isDocInFocus(): boolean {
        return this.update.view.hasFocus;
    }

    public hasUserTyped(): boolean {
        const userEvents = this.getUserEvents();
        return userEvents.contains(UserEvent.INPUT_TYPE) || this.isTextAdded();
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
        return this.update.state.doc.sliceString(0, this.getCursorLocation());
    }

    private getCursorLocation(): number {
        return this.update.state.selection.main.head;
    }

    getSuffix(): string {
        return this.update.state.doc.sliceString(this.getCursorLocation());
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

export default DocumentChangesListener;
