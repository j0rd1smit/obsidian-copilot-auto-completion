import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const messages: FewShotExample = {
    context: Context.MathBlock,
    input: String.raw`# Sample mean
The sample mean, or sometime called average, is defined as:

$$
sample\_mean(x) = <mask/>
$$
The average value has the property that 50% of the weighted* value will be above and below it. This weighted property can make it more sensitive to outliers than the median.
`,
    answer: String.raw`THOUGHT: The text is about sample mean; the math block needs LaTeX for the sum of observations divided by the number of observations.
LANGUAGE: LaTeX, English 
ANSWER: \frac{1}{n} \sum_i^n x_i`,
};

export default messages;
