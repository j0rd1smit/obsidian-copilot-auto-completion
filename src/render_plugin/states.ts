import {
    EditorSelection,
    EditorState,
    SelectionRange,
    StateEffect,
    StateField,
    Transaction,
    TransactionSpec,
} from "@codemirror/state";
import {InlineSuggestion, OptionalSuggestion} from "./types";
import {EditorView} from "@codemirror/view";

const InlineSuggestionEffect = StateEffect.define<InlineSuggestion>();

export const InlineSuggestionState = StateField.define<OptionalSuggestion>({
    create(): OptionalSuggestion {
        return null;
    },
    update(
        value: OptionalSuggestion,
        transaction: Transaction
    ): OptionalSuggestion {
        const inlineSuggestion = transaction.effects.find((effect) =>
            effect.is(InlineSuggestionEffect)
        );

        if (
            inlineSuggestion?.value?.doc !== undefined
        ) {
            return inlineSuggestion.value.suggestion;
        }
        return null;
    },
});

export const updateSuggestion = (
    view: EditorView,
    suggestion: string
) => {
    const doc = view.state.doc;
    sleep(1).then(() => {
        view.dispatch({
            effects: InlineSuggestionEffect.of({
                suggestion: {
                    value: suggestion,
                    render: true,
                },
                doc: doc,
            }),
        });
    });
};

export const cancelSuggestion = (view: EditorView) => {
    const doc = view.state.doc;
    sleep(1).then(() => {
        view.dispatch({
            effects: InlineSuggestionEffect.of({
                suggestion: {
                    value: "",
                    render: false,
                },
                doc: doc,
            }),
        });
    });
};

export const insertSuggestion = (view: EditorView, suggestion: string) => {
    view.dispatch({
        ...createInsertSuggestionTransaction(
            view.state,
            suggestion,
            view.state.selection.main.from,
            view.state.selection.main.to
        ),
    });
};


function createInsertSuggestionTransaction(
    state: EditorState,
    text: string,
    from: number,
    to: number
): TransactionSpec {
    const docLength = state.doc.length;
    if (from < 0 || to > docLength || from > to) {
        // If the range is not valid, return an empty transaction spec.
        return {changes: []};
    }

    const createInsertSuggestionTransactionFromSelectionRange = (
        range: SelectionRange
    ) => {

        if (range === state.selection.main) {
            return {
                changes: {from, to, insert: text},
                range: EditorSelection.cursor(to + text.length),
            };
        }
        const length = to - from;
        if (hasTextChanged(from, to, state, range)) {
            return {range};
        }
        return {
            changes: {
                from: range.from - length,
                to: range.from,
                insert: text,
            },
            range: EditorSelection.cursor(range.from - length + text.length),
        };
    };

    return {
        ...state.changeByRange(
            createInsertSuggestionTransactionFromSelectionRange
        ),
        userEvent: "input.complete",
    };
}

function hasTextChanged(
    from: number,
    to: number,
    state: EditorState,
    changeRange: SelectionRange
) {
    if (changeRange.empty) {
        return false;
    }
    const length = to - from;
    if (length <= 0) {
        return false;
    }
    if (changeRange.to <= from || changeRange.from >= to) {
        return false;
    }
    // check out of bound
    if (changeRange.from < 0 || changeRange.to > state.doc.length) {
        return false;
    }

    return (
        state.sliceDoc(changeRange.from - length, changeRange.from) !=
        state.sliceDoc(from, to)
    );
}
