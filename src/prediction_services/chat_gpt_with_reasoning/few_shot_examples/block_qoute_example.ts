import Context from "../../../context_detection";
import {FewShotExample} from "../../../settings/versions";


const example: FewShotExample = {
    context: Context.BlockQuotes,
    input: `# Matthew effect
The Matthew effect is named after the following New Testament verse:
> <mask/>
According to Malcolm Gladwell, the Matthew effect means that more successful people are most likely given special attention and opportunities leading to further success. `,
    answer: `THOUGHT: The <mask/> is located inside a Markdown quote block, so I should write a quote. The text after <mask/> is about the Matthew effect. The text before <mask/> say the quote is from the New Testament. So my answer should contain something from the New Testament that is about the Matthew effect.
ANSWER: For unto everyone that hath shall be given, and he shall have abundance. 
>  But from him that hath not shall taken away even that which he hath.
>  Matthew 25:29`,
};

export default example;
