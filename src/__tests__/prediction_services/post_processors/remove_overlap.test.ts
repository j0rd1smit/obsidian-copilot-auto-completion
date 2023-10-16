import {expect, test} from '@jest/globals';
import RemoveOverlap from "../../../prediction_services/post_processors/remove_overlap";
import Context from "../../../context_detection";



const noOverWithPrefixData = [
    ["Hello ", "General Kenobi", "there. "],
    ["Hello", "World", ""],
    ["abc", "", "efg"],
    ["", "abc", "efg"],
    ["", "", "efg"],
];
test.each(noOverWithPrefixData)(
    `noOverWithPrefix('%s', '%s', '%s')`,
    (prefix, suffix, result) => {
        const postProcessor = new RemoveOverlap();
        const result_post_processed = postProcessor.process(prefix, suffix, result, Context.Text);
        expect(result_post_processed).toEqual(result);
    }
);

const noOverWithSuffixData = [
    ["Hello", "there. ", "General Kenobi"],
    ["Hello", "", "World"],
    ["abc", "efg", ""],
    ["", "efg", "abc"],
];
test.each(noOverWithSuffixData)(
    `noOverWithSuffix('%s', '%s', '%s')`,
    (prefix, suffix, result) => {
        const postProcessor = new RemoveOverlap();
        const result_post_processed = postProcessor.process(prefix, suffix, result, Context.Text);
        expect(result_post_processed).toEqual(result);
    }
);

const overWithPrefixData = [
    ["prefix", "suffix", "prefix result ", " result "],
    ["Hello", "", "Hello there.", " there."],
];
test.each(overWithPrefixData)(
    `overWithPrefix('%s', '%s', '%s', '%s')`,
    (prefix, suffix, result, expected) => {
        const postProcessor = new RemoveOverlap();
        const result_post_processed = postProcessor.process(prefix, suffix, result, Context.Text);
        expect(result_post_processed).toEqual(expected);
    }
);

const overWithSuffixData = [
    ["prefix", "suffix", " result suffix", " result "],
    ["Hello ", "there", "Hello there", ""],
]
test.each(overWithSuffixData)(
    `overWithSuffix('%s', '%s', '%s', '%s')`,
    (prefix, suffix, result, expected) => {
        const postProcessor = new RemoveOverlap();
        const result_post_processed = postProcessor.process(prefix, suffix, result, Context.Text);
        expect(result_post_processed).toEqual(expected);
    }
);
