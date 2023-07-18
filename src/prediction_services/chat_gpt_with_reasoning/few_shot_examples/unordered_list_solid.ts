import { FewShotExample } from "../../types";
import Context from "../../../context_detection";

const example: FewShotExample = {
    context: Context.UnorderedList,
    input: `# SOLID
SOLID is a set of design principles from Robert C. Martin. It consists of the following sub-principles:
- S: Single Responsibility Principle: A class should have only one reason to change, meaning it should only have one job or responsibility.<mask/>
- I: Interface Segregation Principle: Clients should not be forced to depend on interfaces they do not use.
- D: Dependency Inversion Principle: High-level modules should not depend on low-level modules, but both should depend on abstractions.
`,
    answer: `THOUGHT: The <mask/> is located inside a Markdown list. The text before the list is about SOLID. The list item before the mask is about Single Responsibility Principle. The list items Interface Segregation and Dependency Inversion principles. So the Open-Closed and Liskov Substitution principles are missing. So my answer should contain these list items.
ANSWER:
- O: Open-Closed Principle: Software entities should be open for extension, but closed for modification.
- L: Liskov Substitution Principle: Subtypes must be substitutable for their base types without altering the correctness of the program.`,
};

export default example;
