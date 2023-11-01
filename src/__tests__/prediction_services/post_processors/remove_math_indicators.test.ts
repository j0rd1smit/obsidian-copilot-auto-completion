import {expect, test} from '@jest/globals';
import Context from "../../../context_detection";
import RemoveMathIndicators from "../../../prediction_services/post_processors/remove_math_indicators";


const removeMathTagsData = [
    ["$1 + 2$", "1 + 2"], // wrapped inline
    ["$1 + 2", "1 + 2"], // partial inline start
    ["1 + 2$", "1 + 2"], // partial inline end
    ["$$\nx_i\n$$", "x_i"], // wrapped multi-line
    ["x_i\n$$", "x_i"], // partial wrapped multi-line
];

test.each(removeMathTagsData)(
    `removeMathTags('%s', '%s')`,
    (completion, expected) => {
        expect(removeMathIndicators(completion, Context.MathBlock)).toEqual(expected);
    }
);



function removeMathIndicators(completion: string, context: Context): string {
    const postProcessor = new RemoveMathIndicators();
    const prefix = "does not matter";
    const suffix = "does not matter";
    const result_post_processed = postProcessor.process(prefix, suffix, completion, context);
    return result_post_processed
}

const doNothingIfNotMathContextData = [
    ["$1 + 1$", Context.Text],
    ["$1 + 3$", Context.Heading],
    ['$$\n1 + 1\n$$```', Context.TaskList],
]

test.each(doNothingIfNotMathContextData)(
    `doNothingIfNotMathContext('%s', '%s)`,
    (completion, context: any) => {
        expect(removeMathIndicators(completion, context)).toEqual(completion);
    }
);


test('scenario test', () => {
    const completion = `
`;
    const expected = `
`;

    expect(removeMathIndicators(completion, Context.MathBlock)).toEqual(expected);
});


