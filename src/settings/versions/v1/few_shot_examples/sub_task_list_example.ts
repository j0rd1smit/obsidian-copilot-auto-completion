import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.TaskList,
    input: `# Prepare for conference
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
    answer: `THOUGHT: The answer must be a subtask of 'Pack suitcase'; typical subtasks: 'Clothes,' 'Toiletries,' 'Travel documents'; ' - [ ] ' already there.
LANGUAGE: English
ANSWER: Clothes`,
};

export default example;
