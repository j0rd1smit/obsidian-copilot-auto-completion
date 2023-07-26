import Context from "../../context_detection";
import {PostProcessor} from "../types";

class RemoveDuplicateDashes implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string {
        if (context === Context.UnorderedList && prefix.trim().endsWith("-")) {
            if (result.trim().startsWith("-")) {
                result = result.trim().slice(1);
            }
        }

        return result;
    }
}

export default RemoveDuplicateDashes;
