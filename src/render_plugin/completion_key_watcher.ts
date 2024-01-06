import { keymap } from "@codemirror/view";

import { Prec } from "@codemirror/state";

function CompletionKeyWatcher(
    handleAcceptKey: () => boolean,
    handlePartialAcceptKey: () => boolean,
    handlePartialUndoKey: () => boolean,
    handleCancelKey: () => boolean
) {
    return Prec.highest(
        keymap.of([
            {
                key: "Tab",
                run: handleAcceptKey,
            },
            {
                key: "ArrowRight",
                run: handlePartialAcceptKey,
            },
            {
                key: "ArrowLeft",
                run: handlePartialUndoKey,
            },
            {
                key: "Escape",
                run: handleCancelKey,
            },
        ])
    );
}

export default CompletionKeyWatcher;
