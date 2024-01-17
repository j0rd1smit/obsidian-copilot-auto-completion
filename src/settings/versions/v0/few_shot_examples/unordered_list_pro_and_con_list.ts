import {FewShotExample} from "../../shared";
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
    answer: `THOUGHT: The <mask/> is located inside a Markdown list. The dash is already there, so I don't need to write it. The text before the <mask/> is about the ReLU activation function, and it looks like this list is about the advantages of the relu function. The text after the <mask/> is about the disadvantages of the ReLU function. So my answer should finish the advantage item and maybe suggest a new advantage. 
ANSWER: Computational cheap activations and gradients.
- Vanishing gradient problem is rare, assuming correct weight initialization.`,
};

export default example;
