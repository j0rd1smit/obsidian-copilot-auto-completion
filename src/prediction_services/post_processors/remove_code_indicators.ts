import Context from "../../context_detection";
import { PostProcessor } from "../types";

class RemoveCodeIndicators implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
        context: Context
    ): string {
        if (context === Context.CodeBlock) {
            completion = completion.replace(/```[a-zA-z]+[ \t]*\n?/g, "");
            completion = completion.replace(/\n?```[ \t]*\n?/g, "");
            completion = completion.replace(/`/g, "");
        }


        return completion;
    }
}

export default RemoveCodeIndicators;
