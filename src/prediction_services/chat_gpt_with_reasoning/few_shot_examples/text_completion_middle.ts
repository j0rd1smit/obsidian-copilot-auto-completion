import {FewShotExample} from "../../../settings/versions";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.Text,
    input: `# Digitizing sound waves
Typical sound waves are complex and consist of multiple waves each with their amplitude, frequency, and phase. When we digitize a sound, we sample the amplitude, the difference compared to the base level, at fixed intervals. This gives a sequence of digital values that can be used to approximate the original sound wave by recreating the pressure changes over time. <mask/> The sampling rate must be chosen correctly, else we cannot represent specific frequencies, or we introduce unintended distortions.`,
    answer: `THOUGHT: The paragraph is in English so the answer must be in this language. The text before the <mask/> is about digitizing sound waves. The text after the <mask/> mentions the sampling rate, but it never explains what it is. So the answer should be a sentence that explains what the sampling rate is writing in such a way that it fits with the text before and after the <mask/>.
ANSWER: The chosen interval is known as the sampling rate.`,
};

export default example;
