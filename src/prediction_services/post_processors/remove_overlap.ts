import Context from "../../context_detection";
import { PostProcessor } from "../types";


class RemoveOverlap implements PostProcessor {
    process(
        prefix: string,
        suffix: string,
        completion: string,
        context: Context
    ): string {
        const prefixLastLine: string = prefix.split('\n').slice(-1)[0];
        const suffixFirstLine: string = suffix.split('\n')[0];

        const prefixCompletionOverlap: string = findWordOverlap(prefixLastLine, completion);
        const suffixCompletionOverlap: string = findWordOverlap(completion, suffixFirstLine);
        completion = completion.replace(prefixCompletionOverlap, "");
        completion = completion.replace(suffixCompletionOverlap, "");
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



function findWordOverlap(left: string, right: string): string {
    right = right.trimStart();

    const startIdxOfEachWord = startLocationOfEachWord(left);

    while (startIdxOfEachWord.length > 0) {
        const idx = startIdxOfEachWord.pop();
        const leftSubstring = left.slice(idx);
        if (right.startsWith(leftSubstring)) {
            return leftSubstring;
        }
    }

    return "";
}

function startLocationOfEachWord(text: string): number[] {
    const locations: number[] = [];
    if (text.length > 0 && !text[0].match(/\s/)) {
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
    return char !== undefined && char.match(/[ \t]/) !== null;
}




export default RemoveOverlap;
