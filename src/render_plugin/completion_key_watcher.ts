import { keymap } from "@codemirror/view";

import { Prec } from "@codemirror/state";

function CompletionKeyWatcher(
    handleAcceptonKey: () => boolean,
    handleCancelKey: () => boolean
) {
    return Prec.highest(
        keymap.of([
            {
                key: "Tab",
                run: handleAcceptonKey,
            },
            {
                key: "Escape",
                run: handleCancelKey,
            },
        ])
    );
}

export default CompletionKeyWatcher;
