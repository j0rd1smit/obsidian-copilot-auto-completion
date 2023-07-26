import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from "@codemirror/view";
import {cancelSuggestion, InlineSuggestionState} from "./states";
import { Prec } from "@codemirror/state";
import {OptionalSuggestion, Suggestion} from "./types";

const RenderSuggestionPlugin = () =>
    Prec.lowest(
        // must be lowest else you get infinite loop with state changes by our plugin
        ViewPlugin.fromClass(
            class RenderPlugin {
                decorations: DecorationSet;
                suggestion: Suggestion;

                constructor(view: EditorView) {
                    this.decorations = Decoration.none;
                    this.suggestion = {
                        value: "",
                        render: false,
                    }
                }

                async update(update: ViewUpdate) {
                    const suggestion: OptionalSuggestion = update.state.field(
                        InlineSuggestionState
                    );

                    if (suggestion === null || suggestion === undefined) {
                        return;
                    }
                    this.suggestion = suggestion;

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
    display_suggestion: Suggestion
) {
    const post = view.state.selection.main.head;

    if (!display_suggestion.render) {
        return Decoration.none;
    }

    try {
        const widget =  new InlineSuggestionWidget(display_suggestion.value, view);
        const decoration = Decoration.widget({
            widget,
            side: 1,
        });

    return Decoration.set([decoration.range(post)]);
    }
    catch (e) {
        console.log(e);
        return Decoration.none;
    }

}

class InlineSuggestionWidget extends WidgetType {
    constructor(readonly display_suggestion: string, readonly view: EditorView) {
        super();
        this.display_suggestion = display_suggestion;
        this.view = view;
    }

    eq(other: InlineSuggestionWidget) {
        return other.display_suggestion == this.display_suggestion;
    }

    toDOM() {
        const span = document.createElement("span");
        span.textContent = this.display_suggestion;
        span.style.opacity = "0.4"; // TODO replace with css
        span.onclick = () => {
           cancelSuggestion(this.view);
        }
        span.onselect = () => {
            cancelSuggestion(this.view);
        }

        return span;
    }

    destroy(dom: HTMLElement) {
        super.destroy(dom);
    }

}

export default RenderSuggestionPlugin;
