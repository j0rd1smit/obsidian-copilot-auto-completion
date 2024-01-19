import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Heading,
    input: `# <mask/>
A neuron is considered dead if it does not activate for any of the training instance in the training dataset. Because it never activates it will never have a gradient due to the chain rule so it also cannot change anymore. The dead ReLU problem can have due to a wide variety of reasons, such as:
1. Poorly initialized weights.
2. Extremely high learning rates during training.
`,
    answer: `THOUGHT: The paragraph discusses the ReLU activation function, and dead neurons never activate. This problem is named the "Dead ReLU problem".
LANGUAGE: English
ANSWER: The dead ReLU problem`,
};

export default example;
