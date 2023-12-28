import {FewShotExample} from "../../../settings/versions";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.NumberedList,
    input: `# Binary search
Binary is a sorting O(log(n)) sorting algorithm. It works as follows:
1. Ensure you have a sorted array.
2. Check the middle element in the list:
3. Return the index if this is the item you are looking for.
4. <mask/>
`,
    answer: `THOUGHT: THOUGHT: The <mask/> is located inside a Markdown list. The current number 4 and it is already written so I should not be in the answer. The text before the <mask/> is bout the binary search algorithm and steps in the algorithm but a few steps are missing. There is no text after the <mask/>. So my answer should the remaining steps of the algorithm.
ANSWER: Go to step 2 with the remaining right half if the item is smaller than the target.
5. Go to step 2 with the remaining left half if the item is larger than the target.
6. If there are no more elements to check, the return indicates that the item is not in the list.`,
};

export default example;
