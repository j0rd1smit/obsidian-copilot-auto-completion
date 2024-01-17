import {FewShotExample} from "../../index";
import Context from "../../../../context_detection";

const example: FewShotExample = {
    context: Context.Text,
    input: `# Locality-sensitive hashing (LSH)
Locality-sensitive hashing (LSH) is an algorithm that hashes similar items into the same buckets with high probability.

## Potential problems
### Collision (AND)
This happens when distant points are hashed into the same bucket. <mask/>

### Split (OR)
Nearby points are hashed into different buckets. This problem can be solved by using multiple hash tables instead of one. Points are candidates neighbors if they are a candidate in any of the hash tables. As a result the false negative rate reduces significantly, while the false positives rate only increase slightly.`,
    answer: `THOUGHT: The answer must be the next sentence. It must explain the strategy to mitigate a collision problem, such as having multiple projections/hashes per table.
LANGUAGE: English
ANSWER: This problem can be solved by having multiple projections/hashes per table, where points are candidates' neighbors if they occur in all query bins.`,
};

export default example;
