import { Transaction } from "@codemirror/state";

enum UserEvent {
    INPUT = "input",
    INPUT_TYPE = "input.type",
    INPUT_TYPE_COMPOSE = "input.type.compose",
    INPUT_PASTE = "input.paste",
    INPUT_DROP = "input.drop",
    INPUT_COMPLETE = "input.complete",
    DELETE = "delete",
    DELETE_SELECTION = "delete.selection",
    DELETE_FORWARD = "delete.forward",
    DELETE_BACKWARDS = "delete.backward",
    DELETE_CUT = "delete.cut",
    MOVE = "move",
    MOVE_DROP = "move.drop",
    CURSOR_MOVED = "select",
    CURSOR_MOVED_BY_MOUSE = "select.pointer",
    UNDO = "undo",
    REDO = "redo",
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace UserEvent {
    export function isDelete(event: UserEvent) {
        return event.contains("delete");
    }

    export function values_string(): Array<string> {
        return Object.values(UserEvent).map((event) => event.toString());
    }

    export function fromString(event: string) {
        const keys = Object.keys(UserEvent) as Array<keyof typeof UserEvent>;
        for (const key of keys) {
            if (event === UserEvent[key]) {
                return UserEvent[key] as UserEvent;
            }
        }
        return null;
    }

    export function fromTransaction(transaction: Transaction) {
        for (const inputType of UserEvent.values_string()) {
            if (transaction.isUserEvent(inputType)) {
                const event = UserEvent.fromString(inputType);
                if (event) {
                    return event;
                }
            }
        }
        return null;
    }
}

export default UserEvent;
