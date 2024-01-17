import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Heading,
    input: `# The Softmax <mask/>
The softmax function transforms a vector into a probability distribution such that the sum of the vector is equal to 1.`,
    answer: `THOUGHT: The paragraph describes the softmax function and converts the vector to probability distributions; the title already contains "The softmax," and the answer must complete this.
LANGUAGE: English
ANSWER: function`,
};

export default example;
