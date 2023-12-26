import {FewShotExample} from "../../../settings/settings";
import Context from "../../../context_detection";

const messages: FewShotExample = {
    context: Context.MathBlock,
    input: String.raw`# Logarithm definition
A logarithm is the power to which a base must be raised to yield a given number. For example $2^3 =8$; therefore, 3 is the logarithm of 8 to base 2, or in other words $<mask/>$.3 = 

	`,
    answer: String.raw`THOUGHT: The <mask/> is located inline math block. The text before the mask is about logarithm. The text is giving an example but the math notation still needs to be completed. So my answer should be the latex formula for this example.  
ANSWER: 3 = \log_2(8)`,
};

export default messages;
