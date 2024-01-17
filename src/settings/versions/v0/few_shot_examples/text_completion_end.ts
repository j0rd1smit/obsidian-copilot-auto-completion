import {FewShotExample} from "../../shared";
import Context from "../../../../context_detection";


const example: FewShotExample = {
    context: Context.Text,
    input: `# Locality-sensitive hashing (LSH)
Locality-sensitive hashing (LSH) is an algorithm that hashes similar items into the same buckets with high probability.

## Potential problems
### Collision (AND)
This happens when distant points are hashed into the same bucket. <mask/>

### Split (OR)
Nearby points are hashed into different buckets. This problem can be solved by using multiple hash tables instead of one. Points are candidates neighbors if they are a candidate in any of the hash tables. As a result the false negative rate reduces significantly, while the false positives rate only increase slightly.
`,
    answer: `THOUGHT: The <mask/> is located in a paragraph at the end of sentence, so the answer should offer a completion of this paragraph. The paragraph is in English so the answer must be in this language. The text be the <mask/> is about Locality-sensitive hashing and its potential problems, so my answer should reflect that. The text after the <mask/> is a similiar paragraph about the second problem of Locality-sensitive hashing. So my answer should be about the split problem problem, so my answer should have a similar structure as this paragraph.
ANSWER:This problem can be solved by having multiple projection/hashes per table, where points are candidates neighbors if they occur in all query bins. As a result the false positive rate reduces significantly, while the false negative rate only increase slightly.`,
};

export default example;
