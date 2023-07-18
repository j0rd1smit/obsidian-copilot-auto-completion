import { FewShotExample } from "../../types";
import Context from "../../../context_detection";

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
    answer: `THOUGHT: The <mask/> is located in JavaScript code block. The text before the <mask/> is describes what a debounce function does, and it defines the function signature. So the answer should not include the function signature to avoid duplication. The <mask/> is inside this function, so the answer should finish the implementation of the function. There is some indentation before the <mask/>, so the answer should be indented as well.
ANSWER:let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };`,
};

export default messages;
