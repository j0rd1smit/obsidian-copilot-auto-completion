import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.UnorderedList,
    input: `# Relu activation function
The ReLU activation function is a relatively simple non-linear function:
$$
ReLU(x) = max(0, x)
$$
Advantages:
- <mask/>

Disadvantages:
- Dead ReLU problem, whereby specific activation will only output zeros and thus will not have any gradients. This can be computationally wasteful since we still need matrix multiplication.
- Range $[0, \\infty]$ so Exploding Gradients can still be a problem.
`,
    answer: `THOUGHT: Answer must be advantage of ReLU: simple, efficient, sparsity, addresses vanishing gradient to some extent, popular in practice. The "- " is already there.
LANGUAGE: English
ANSWER: Computational cheap activations and gradients.
- Vanishing gradient problem is rare, assuming correct weight initialization.`,
};

export default example;
