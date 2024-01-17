import {FewShotExample} from "../../shared";
import Context from "../../../../context_detection";


const messages: FewShotExample = {
    context: Context.CodeBlock,
    input: `\`\`\`python
def fibonacci(<mask/>) -> int:
\tif n == 0 or n == 1:
\t\treturn n
\telse:
\t\treturn fibonacci(n-1) + fibonacci(n-2)
\`\`\`
`,
    answer: `THOUGHT: The <mask/> is located in Python code block. Based on the location of </mask> I should write the function's arguments and types. Based on the text after </mask>, I see that the function uses a variable n with type int, which is not yet defined.
ANSWER: n: int`,
};

export default messages;
