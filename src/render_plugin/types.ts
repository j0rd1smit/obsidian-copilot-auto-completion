import { Text } from "@codemirror/state";

export type Suggestion = string;
export type OptionalSuggestion = Suggestion | null;

export interface InlineSuggestion {
    suggestion: OptionalSuggestion;
    doc: Text | null;
}
