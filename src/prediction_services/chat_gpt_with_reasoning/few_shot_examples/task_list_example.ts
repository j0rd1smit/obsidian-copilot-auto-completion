import {FewShotExample} from "../../../settings/versions";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.TaskList,
    input: ` # Write blog post about Obsidian
For my Obsidian blog post, I need to do the following:
- [ ] Research about Obsidian.
- [ ] Create an outline for the blog.<mask/>
`,
    answer: `THOUGHT: The <mask/> is located inside a Markdown task list. The tasks before the <mask/> are about writing a blog about Obsidian. There is no text after the <mask/>. The task before the <mask/> looks already finished. So my answer should contain additional tasks that are not already there and should be help to complete this blog post. 
ANSWER:
- [ ] Gather relevant visual aids.  
- [ ] Write the first draft  
- [ ] Review and edit the first draft  
`,
};

export default example;
