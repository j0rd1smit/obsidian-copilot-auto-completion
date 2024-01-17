import Context from "../../context_detection";
import { PostProcessor } from "../types";


class RemoveOverlap implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
        context: Context
    ): string {
        completion = removeWordOverlapPrefix(prefix, completion);
        completion = removeWordOverlapSuffix(completion, suffix);
        completion = removeWhiteSpaceOverlapPrefix(suffix, completion);
        completion = removeWhiteSpaceOverlapSuffix(completion, suffix);

        return completion;
    }
}


function removeWhiteSpaceOverlapPrefix(prefix: string, completion: string): string {
    let prefixIdx = prefix.length - 1;
    while (completion.length > 0 && completion[0] === prefix[prefixIdx]) {
        completion = completion.slice(1);
        prefixIdx--;
    }
    return completion;
}


function removeWhiteSpaceOverlapSuffix(completion: string, suffix: string): string {
    let suffixIdx = 0;
    while (completion.length > 0 && completion[completion.length -1] === suffix[suffixIdx]) {
        completion = completion.slice(0, -1);
        suffixIdx++;
    }
    return completion;
}

function removeWordOverlapPrefix(prefix: string, completion: string): string {
    const rightTrimmed = completion.trimStart();

    const startIdxOfEachWord = startLocationOfEachWord(prefix);

    while (startIdxOfEachWord.length > 0) {
        const idx = startIdxOfEachWord.pop();
        const leftSubstring = prefix.slice(idx);
        if (rightTrimmed.startsWith(leftSubstring)) {
            return rightTrimmed.replace(leftSubstring, "");
        }
    }

    return completion;
}

function removeWordOverlapSuffix(completion: string, suffix: string): string {
    const suffixTrimmed = removeLeadingWhiteSpace(suffix);

    const startIdxOfEachWord = startLocationOfEachWord(completion);

    while (startIdxOfEachWord.length > 0) {
        const idx = startIdxOfEachWord.pop();
        const suffixSubstring = completion.slice(idx);
        if (suffixTrimmed.startsWith(suffixSubstring)) {
            return completion.replace(suffixSubstring, "");
        }
    }

    return completion;
}

function removeLeadingWhiteSpace(completion: string): string {
    return completion.replace(/^[ \t\f\r\v]+/, "");
}

function startLocationOfEachWord(text: string): number[] {
    const locations: number[] = [];
    if (text.length > 0 && !isWhiteSpaceChar(text[0])) {
        locations.push(0);
    }

    for (let i = 1; i < text.length; i++) {
        if (isWhiteSpaceChar(text[i - 1]) && !isWhiteSpaceChar(text[i])) {
            locations.push(i);
        }
    }

    return locations;
}

function isWhiteSpaceChar(char: string|undefined): boolean {
    return char !== undefined && char.match(/\s/) !== null;
}

export default RemoveOverlap;
