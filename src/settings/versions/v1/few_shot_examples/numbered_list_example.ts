import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.NumberedList,
    input: `# Binary search
Binary is a sorting O(log(n)) searching algorithm. It works as follows:
1. Ensure you have a sorted array.
2. Check the middle element in the list:
3. Return the index if this is the item you are looking for.
4. <mask/>
5. Go to step 2 with the remaining left half if the item is larger than the target.
6. If there are no more elements to check, the return indicates that the item is not in the list.
`,
    answer: `THOUGHT: The list contains steps of the binary search algorithm. It is missing the decision to split right if item < target.
LANGUAGE: English
ANSWER: Go to step 2 with the remaining right half if the item is smaller than the target.`,
};

export default example;
