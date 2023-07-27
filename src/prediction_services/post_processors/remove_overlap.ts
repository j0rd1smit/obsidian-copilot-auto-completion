import Context from "../../context_detection";
import { PostProcessor } from "../types";


class RemoveOverlap implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        result: string,
        context: Context
    ): string {
        return removeOverlap(prefix, result);
    }
}



function removeOverlap(a: string, b: string) {
    const overlap = findOverlap(a, b);

    return b.replace(overlap, "");

}

function findOverlap(a: string, b: string) {
    const wordsB = b.trimStart().split(" ");
    const wordsA = a.trimEnd().split(" ").reverse().slice(0, wordsB.length).reverse()
    const bString = wordsB.join(" ");


    while (wordsA.length > 0) {
        const aString = wordsA.join(" ");
        if (bString.startsWith(aString)) {
            return aString;
        }
        wordsA.shift();
    }
    return "";

}

export default RemoveOverlap;
