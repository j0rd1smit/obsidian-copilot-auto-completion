import Context from "../../context_detection";
import { PostProcessor } from "../types";

class RemoveCodeIndicators implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string {
        if (context === Context.CodeBlock) {
            result = result.replace(/(```[a-zA-z]+)|(```)|`/g, "");
        }

        return result;
    }
}

export default RemoveCodeIndicators;
