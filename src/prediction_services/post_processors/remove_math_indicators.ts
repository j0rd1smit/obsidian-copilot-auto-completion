import { PostProcessor } from "../types";
import Context from "../../context_detection";

class RemoveMathIndicators implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
        context: Context
    ): string {
        if (context === Context.MathBlock) {
            completion = completion.replace(/\n?\$\$\n?/g, "");
            completion = completion.replace(/\$/g, "");
        }

        return completion;
    }
}

export default RemoveMathIndicators;
