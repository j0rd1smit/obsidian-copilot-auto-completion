import { PrefixAndSuffix, PreProcessor } from "../types";
import Context from "../../context_detection";

class LengthLimiter implements PreProcessor {
    private readonly maxPrefixChars: number;
    private readonly maxSuffixChars: number;

    constructor(maxPrefixChars: number, maxSuffixChars: number) {
        this.maxPrefixChars = maxPrefixChars;
        this.maxSuffixChars = maxSuffixChars;
    }

    process(prefix: string, suffix: string, context: Context): PrefixAndSuffix {
        prefix = prefix.slice(-this.maxPrefixChars);
        suffix = suffix.slice(0, this.maxSuffixChars);
        return { prefix, suffix };
    }

    removesCursor(prefix: string, suffix: string): boolean {
        return false;
    }
}

export default LengthLimiter;
