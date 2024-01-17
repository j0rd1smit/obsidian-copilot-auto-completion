import Context from "../../../../context_detection";
import {FewShotExample} from "../../index";


const example: FewShotExample = {
    context: Context.BlockQuotes,
    input: `# Matthew effect
In the book Outliers, Malcolm Gladwell popularized the term Matthew effect.
This effect is named after the following New Testament verse:
> <mask/>
According to Malcolm Gladwell, the Matthew effect means that more successful people are most likely given special attention and opportunities leading to further success.`,
    answer: `THOUGHT: The answer is a biblical verse from Matthew's effect, related to accumulating advantage; Gladwell mentions it in Outliers.
LANGUAGE: English
ANSWER: For unto everyone that hath shall be given, and he shall have abundance. But from him that hath not shall taken away even that which he hath.
>  Matthew 25:29`,
};

export default example;
