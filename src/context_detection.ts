import { generateRandomString } from "./utils";

const UNIQUE_CURSOR = `${generateRandomString(16)}`;
const HEADER_REGEX = new RegExp(`^#+\\s.*${UNIQUE_CURSOR}.*$`, "gm");
const UNORDERED_LIST_REGEX = new RegExp(`^\\s*-\\s.*${UNIQUE_CURSOR}.*$`, "gm");
const TASK_LIST_REGEX = new RegExp(
    `^\\s*- \\[.\\]\\s.*${UNIQUE_CURSOR}.*$`,
    "gm"
);
const BLOCK_QUOTES_REGEX = new RegExp(`^\\s*>.*${UNIQUE_CURSOR}.*$`, "gm");
const NUMBERED_LIST_REGEX = new RegExp(
    `^\\s*\\d+\\.\\s.*${UNIQUE_CURSOR}.*$`,
    "gm"
);
const MATH_BLOCK_REGEX = /\$\$[\s\S]*?\$\$/g;
const INLINE_MATH_BLOCK_REGEX = /\$[\s\S]*?\$/g;
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;

enum Context {
    Text = "Text",
    Heading = "Heading",
    BlockQuotes = "BlockQuotes",
    UnorderedList = "UnorderedList",
    NumberedList = "NumberedList",
    CodeBlock = "CodeBlock",
    MathBlock = "MathBlock",
    TaskList = "TaskList",
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Context {
    export function values(): Array<Context> {
        return Object.values(Context).filter(
            (value) => typeof value === "string"
        ) as Array<Context>;
    }

    export function getContext(prefix: string, suffix: string): Context {
        if (HEADER_REGEX.test(prefix + UNIQUE_CURSOR + suffix)) {
            return Context.Heading;
        }
        if (BLOCK_QUOTES_REGEX.test(prefix + UNIQUE_CURSOR + suffix)) {
            return Context.BlockQuotes;
        }

        if (TASK_LIST_REGEX.test(prefix + UNIQUE_CURSOR + suffix)) {
            return Context.TaskList;
        }

        if (
            isCursorInRegexBlock(prefix, suffix, MATH_BLOCK_REGEX) ||
            isCursorInRegexBlock(prefix, suffix, INLINE_MATH_BLOCK_REGEX)
        ) {
            return Context.MathBlock;
        }

        if (isCursorInRegexBlock(prefix, suffix, CODE_BLOCK_REGEX)) {
            return Context.CodeBlock;
        }
        if (NUMBERED_LIST_REGEX.test(prefix + UNIQUE_CURSOR + suffix)) {
            return Context.NumberedList;
        }
        if (UNORDERED_LIST_REGEX.test(prefix + UNIQUE_CURSOR + suffix)) {
            return Context.UnorderedList;
        }

        return Context.Text;
    }

    export function get(value: string) {
        for (const context of Context.values()) {
            if (value === context) {
                return context;
            }
        }
        return undefined;
    }
}

function isCursorInRegexBlock(
    prefix: string,
    suffix: string,
    regex: RegExp
): boolean {
    const text = prefix + UNIQUE_CURSOR + suffix;
    const codeBlocks = extractBlocks(text, regex);
    for (const block of codeBlocks) {
        if (block.includes(UNIQUE_CURSOR)) {
            return true;
        }
    }
    return false;
}

function extractBlocks(text: string, regex: RegExp) {
    const codeBlocks = text.match(regex);
    return codeBlocks ? codeBlocks.map((block) => block.trim()) : [];
}

export default Context;
