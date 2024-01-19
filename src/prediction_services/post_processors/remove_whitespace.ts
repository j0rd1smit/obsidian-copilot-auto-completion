import Context from "../../context_detection";
import {PostProcessor} from "../types";

class RemoveWhitespace implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
        context: Context
    ): string {
        if (context === Context.Text || context === Context.Heading || context === Context.MathBlock || context === Context.TaskList || context === Context.NumberedList || context === Context.UnorderedList) {
            if (prefix.endsWith(" ") || suffix.endsWith("\n")) {
                completion = completion.trimStart();
            }
            if (suffix.startsWith(" ")) {
                completion = completion.trimEnd();
            }
        }

        return completion;
    }
}

export default RemoveWhitespace;
