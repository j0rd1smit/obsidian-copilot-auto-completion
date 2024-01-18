import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Text,
    input: `# Digitizing sound waves 
Typical sound waves are complex and consist of multiple waves, each with amplitude, frequency, and phase.
When we digitize a sound, we sample the amplitude, the difference compared to the base level, at fixed intervals. This gives a sequence of digital values that can be used to approximate the original sound wave by recreating the pressure changes over time. The <mask/> is known as the sampling rate. The sampling rate must be chosen correctly, or we cannot represent specific frequencies or introduce unintended distortions.`,
    answer: `THOUGHT: The text is about digitizing sound waves and the needed properties. The <mask/> is an incomplete sentence starting with 'The' and ending with 'is known as the sampling rate.', I should avoid overlap with this. The answer is a description for the property known as the 'sampling rate'.
LANGUAGE: English
ANSWER: chosen interval`,
};

export default example;
