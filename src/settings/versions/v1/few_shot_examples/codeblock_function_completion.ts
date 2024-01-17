import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const messages: FewShotExample = {
    context: Context.CodeBlock,
    input: `# debounce
A debounce function makes sure that a function is only triggered once per user input. This is useful for event based triggers. You can implement in javascript like this:
\`\`\`javascript
function debounce(func, timeout = 300){
  <mask/>
}
\`\`\`
`,
    answer: `THOUGHT: This should include debounce logic, clearTimeout, setTimeout, prevent rapid calls, and function wrapper.
LANGUAGE: JavaScript
ANSWER:let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };`,
};

export default messages;
