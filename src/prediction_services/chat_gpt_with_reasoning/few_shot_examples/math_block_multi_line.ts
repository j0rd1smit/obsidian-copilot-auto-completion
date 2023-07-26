import { FewShotExample } from "../../types";
import Context from "../../../context_detection";

const messages: FewShotExample = {
    context: Context.MathBlock,
    input: String.raw`# Sample mean
The sample mean, or sometime called average, is defined as:

$$
sample\_mean(x) = <mask/>
$$
The average value has the property that 50% of the weighted* value will be above and below it. This weighted property can make it more sensitive to outliers than the median.
`,
    answer: String.raw`THOUGHT: The <mask/> is located in math block. Based on the text before and after the mask my answer should be the latex formula for the sample mean. 
ANSWER: \frac{1}{n} \sum_i^n x_i`,
};

export default messages;
