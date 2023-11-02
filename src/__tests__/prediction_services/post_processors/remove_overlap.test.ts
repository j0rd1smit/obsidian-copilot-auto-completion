import {expect, test} from '@jest/globals';
import RemoveOverlap from "../../../prediction_services/post_processors/remove_overlap";
import Context from "../../../context_detection";



const noOverWithPrefixData = [
    ["Hello ", "there. "],
    ["Hello my name is bob",  ""],
    ["Hello my name ",  "is bob"],
    ["abc", "efg"],
    ["", "efg"],
];
test.each(noOverWithPrefixData)(
    `noOverWithPrefixShouldKeepCompletionUnchanged('%s',  '%s')`,
    (prefix, completion) => {
        const suffix = "";
        expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(completion);
    }
);

function removeOverlapFromCompletion(prefix: string, suffix: string, completion: string) {
    const postProcessor = new RemoveOverlap();
    return  postProcessor.process(prefix, suffix, completion, Context.Text);
}

const noOverWithSuffixData = [
    ["Hello ", "there."],
    ["General ", "Kenobi"],
    ["abc", "efg"],
    ["", "efg"],
    ["abc", ""],
];
test.each(noOverWithSuffixData)(
    `noOverWithSuffixShouldKeepCompletionUnchanged('%s', '%s')`,
    (completion, suffix) => {
        const prefix = "";
        expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(completion);
    }
);

const overWithPrefixData = [
    ["Hello there general ", "general Kenobi", "Kenobi"],
    ["My name is ", "is Bob!", "Bob!"],
    ["- this is an important ", "this is an important bullet point.", "bullet point."],
    ["    - this is an important", "this is an important nested bullet point.", " nested bullet point."],
    ["- [ ] this is an important", "this is an important task.", " task."],
];
test.each(overWithPrefixData)(
    `overWithPrefixIsRemoved('%s', '%s', '%s', '%s')`,
    (prefix, completion, expected) => {
         const suffix = "";
        expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(expected);
    }
);

const overWithSuffixIsRemovedData = [
    ["Hello there general ", "general Kenobi", "Hello there "],
    ["My name is ", " is Bob!", "My name"],
]
test.each(overWithSuffixIsRemovedData)(
    `overWithSuffixIsRemoved('%s', '%s', '%s',)`,
    (completion, suffix, expected) => {
        const prefix = "";
        expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(expected);
    }
);

test('scenario bullet point', () => {
    const prefix = `
Some advantages are:
- For queries `;
    const completion = `- For queries involving filtering on these columns, bitmap encoding allows for efficient and fast retrieval of relevant data.`;
    const suffix = `
- It can also speed up queries that involve filtering on these columns.`;
    const expected = `involving filtering on these columns, bitmap encoding allows for efficient and fast retrieval of relevant data.`;
    expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(expected);
});

test('scenario with empty line before it', () => {
    const prefix = `The dead ReLU problem can have due to a wide variety of reasons, such as:
- `;
    const completion = `
- Improper weight initialization
- Large learning rates
- Unbalanced data`;
    const suffix = ``;
    const expected = `Improper weight initialization
- Large learning rates
- Unbalanced data`;
    expect(removeOverlapFromCompletion(prefix, suffix, completion)).toEqual(expected);
});
