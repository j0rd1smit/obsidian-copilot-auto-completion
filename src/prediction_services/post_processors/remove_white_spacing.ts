import Context from "../../context_detection";
import { PostProcessor } from "../types";

class RemoveWhiteSpacing implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string {
        return result.trim();
    }
}

export default RemoveWhiteSpacing;
