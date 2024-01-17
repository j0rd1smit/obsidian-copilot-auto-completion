import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const messages: FewShotExample = {
    context: Context.MathBlock,
    input: String.raw`# Logarithm definition
A logarithm is the power to which a base must be raised to yield a given number. For example, $2^3 =8$; therefore, $3$ is the logarithm of $8$ to base $2$, or in other words $ <mask/>$`,
    answer: String.raw`The text close to the <mask/> is about the definition of the log and logarithm of 8 to base 2. The answer is an inline formula for base 2 of 8 equals 3.
LANGUAGE: LaTeX, English
ANSWER: 3 = \log_2(8)`,
};

export default messages;
