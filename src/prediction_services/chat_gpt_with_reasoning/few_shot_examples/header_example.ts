import { FewShotExample } from "../../types";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.Heading,
    input: `# The <mask/>
The softmax function transforms a vector into a probability distribution such that the sum of the vector is equal to 1.`,
    answer: `THOUGHT: <mask/> is located inside a Markdown headings, so I should write a title that is logical with what is already there. The text after <mask/> is about the softmax function, so the title should reflect this.
ANSWER: softmax function`,
};

export default example;
