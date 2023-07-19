import { Text } from "@codemirror/state";

export interface Suggestion {
    value: string;
    render: boolean;
}
export type OptionalSuggestion = Suggestion | null;

export interface InlineSuggestion {
    suggestion: OptionalSuggestion;
    doc: Text | null;
}


