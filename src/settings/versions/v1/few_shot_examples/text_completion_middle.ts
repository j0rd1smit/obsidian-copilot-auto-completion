import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Text,
    input: `# Digitizing sound waves 
Typical sound waves are complex and consist of multiple waves, each with <mask/>
When we digitize a sound, we sample the amplitude, the difference compared to the base level, at fixed intervals. This gives a sequence of digital values that can be used to approximate the original sound wave by recreating the pressure changes over time.  The chosen interval is known as the sampling rate. The sampling rate must be chosen correctly, or we cannot represent specific frequencies or introduce unintended distortions.`,
    answer: `THOUGHT: The answer must complete the partial sentence. The Ttext is about characteristics of waves such as amplitude, frequency, and phase.
LANGUAGE: English
ANSWER: amplitude, frequency, and phase.`,
};

export default example;
