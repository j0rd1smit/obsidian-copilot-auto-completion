import {expect, test} from '@jest/globals';
import Context from "../../../context_detection";
import RemoveCodeIndicators from "../../../prediction_services/post_processors/remove_code_indicators";


const removeCodeTagsData = [
    ["`1 + 2`", "1 + 2"], // wrapped inline
    ["`1 + 2", "1 + 2"], // partial inline start
    ["1 + 2`", "1 + 2"], // partial inline end
    ["```\nprint(x)\n```", "print(x)"], // wrapped multi-line
    ["```python\nprint(x)\n```", "print(x)"], // wrapped multi-line python
    ["```javascript\nconsole.log(x)\n```", "console.log(x)"], // wrapped multi-line javascript
    ["```python\n    print(x)\n```", "    print(x)"], // wrapped multi-line indentation spaces with languages
    ["```\n    print(x)\n```", "    print(x)"], // wrapped multi-line indentation spaces without languages
    ["```python\n\tprint(x)\n```", "\tprint(x)"], // wrapped multi-line indentation tab
    ["```\n\tprint(x)\n```", "\tprint(x)"], // wrapped multi-line indentation tab without languages
    ["```\nprint(x)", "print(x)"], // partial multi-line sa
    ["'x'\n```", "'x'"], // partial multi-line
];

test.each(removeCodeTagsData)(
    `removeCodeTags('%s', '%s')`,
    (completion, expected) => {
        expect(removeCodeIndicators(completion, Context.CodeBlock)).toEqual(expected);
    }
);



function removeCodeIndicators(completion: string, context: Context): string {
    const postProcessor = new RemoveCodeIndicators();
    const prefix = "does not matter";
    const suffix = "does not matter";
    const result_post_processed = postProcessor.process(prefix, suffix, completion, context);
    return result_post_processed
}

const doNothingIfNotCodeContextData = [
    ["`1 + 1`", Context.Text],
    ["`1 + 1`", Context.Heading],
    ['```\n1 + 1\n```', Context.TaskList],
]

test.each(doNothingIfNotCodeContextData)(
    `doNothingIfNotCodeContext('%s', '%s)`,
    (completion, context: any) => {
        expect(removeCodeIndicators(completion, context)).toEqual(completion);
    }
);


test('fibonacci scenario test', () => {
    const completion = `
\`\`\`python
    if n == 0 or n == 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)
\`\`\``;
    const expected = `
    if n == 0 or n == 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)`;

    expect(removeCodeIndicators(completion, Context.CodeBlock)).toEqual(expected);
});

