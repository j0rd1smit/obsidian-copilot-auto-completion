import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Heading,
    input: `# The <mask/> function
The softmax function transforms a vector into a probability distribution such that the sum of the vector is equal to 1.`,
    answer: `THOUGHT: The paragraph describes the softmax function and converts the vector to probability distributions; the title already contains "The" and "function". The answer must add the missing word to the title.
LANGUAGE: English
ANSWER: Softmax`,
};

export default example;
