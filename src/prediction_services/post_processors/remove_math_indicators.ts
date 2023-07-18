import { PostProcessor } from "../types";
import Context from "../../context_detection";

class RemoveMathIndicators implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string {
        if (context === Context.MathBlock) {
            result = result.replace(/\$/g, "");
        }

        return result;
    }
}

export default RemoveMathIndicators;
