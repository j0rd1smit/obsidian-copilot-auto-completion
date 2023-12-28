import {FewShotExample} from "../../../settings/versions";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.TaskList,
    input: ` # Prepare for conference
Before going to a conference, there are a few things to do:
- [ ] Finish presentation
	- [ ] Write outline
	- [ ] Create slides
	- [ ] Practice presentation
- [ ] Book flights  
- [ ] Reserve hotel  
- [ ] Pack suitcase
	- [ ] <mask/>
- [ ] Arrange transportation to airport  
	`,
    answer: `THOUGHT: The <mask/> is located inside a Markdown subtask list. The tasks before and after the <mask/> are about preparing and traveling to a conference. The parent task is about packing a suitcase. The syntax for the subtask is already there, so I don't need to write it. So my answer should finish that subtask. Additionally, the answer can also contain additional subtasks that are not already there.
ANSWER:Clothes  
  - [ ] Toiletries  
  - [ ] Travel documents  
`,
};

export default example;
