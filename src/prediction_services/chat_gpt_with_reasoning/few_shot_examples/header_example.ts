import {FewShotExample} from "../../../settings/versions";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.Heading,
    input: `# The Softmax <mask/>
The softmax function transforms a vector into a probability distribution such that the sum of the vector is equal to 1.`,
    answer: `THOUGHT: <mask/> is located inside a Markdown headings. The header already contains the text "The Softmax" contains so my answer should be coherent with that. The text after <mask/> is about the softmax function, so the title should reflect this.
ANSWER: function`,
};

export default example;
