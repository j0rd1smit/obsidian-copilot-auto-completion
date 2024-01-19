import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.TaskList,
    input: ` # Write blog post about Obsidian
For my Obsidian blog post, I need to do the following:
- [ ] Research about Obsidian.
- [ ] Create an outline for the blog.
- [ ] Gather relevant visual aids.  
- [ ] <mask/>
- [ ] Review and edit the first draft  
`,
    answer: `THOUGHT: The <mask/> is in the middle of a task sequence between gathering visuals before editing 1st draft. The 1st draft is missing and fits the sequence.
LANGUAGE: English
ANSWER: Write the first draft`,
};

export default example;
