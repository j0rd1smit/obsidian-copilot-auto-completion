import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from "@codemirror/view";
import { InlineSuggestionState } from "./states";
import { Prec } from "@codemirror/state";

const RenderSuggestionPlugin = () =>
    Prec.lowest(
        // must be lowest else you get infinite loop with state changes by our plugin
        ViewPlugin.fromClass(
            class RenderPlugin {
                decorations: DecorationSet;
                suggestion = "";

                constructor(view: EditorView) {
                    this.decorations = Decoration.none;
                }

                async update(update: ViewUpdate) {
                    const suggestion = update.state.field(
                        InlineSuggestionState
                    );

                    if (suggestion === null || suggestion === undefined) {
                        return;
                    } else {
                        this.suggestion = suggestion;
                    }

                    this.decorations = inlineSuggestionDecoration(
                        update.view,
                        this.suggestion
                    );
                }
            },
            {
                decorations: (v) => v.decorations,
            }
        )
    );

function inlineSuggestionDecoration(
    view: EditorView,
    display_suggestion: string
) {
    const post = view.state.selection.main.head;

    const decoration = Decoration.widget({
        widget: new InlineSuggestionWidget(display_suggestion),
        side: 1,
    });
    return Decoration.set([decoration.range(post)]);
}

class InlineSuggestionWidget extends WidgetType {
    constructor(readonly display_suggestion: string) {
        super();
        this.display_suggestion = display_suggestion;
    }

    eq(other: InlineSuggestionWidget) {
        return other.display_suggestion == this.display_suggestion;
    }

    toDOM() {
        const span = document.createElement("span");
        span.textContent = this.display_suggestion;
        span.style.opacity = "0.4"; // TODO replace with css class
        return span;
    }
}

export default RenderSuggestionPlugin;
