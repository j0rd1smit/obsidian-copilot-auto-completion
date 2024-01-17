# Demo vault Readme
This is a demo Obsidian vault for testing the plugin.
The command `npm run dev` will ensure the plugin artifacts are symlinked to correct locations allowing you to test the plugin in this vault.
The file contains some example notes with useful content for testing the plugin.

The following files are used to test certain completion scenarios:
- `Block quote (a tale of two cities).md`: contains an example note with a block quote. The plugin should be able to complete the block quote.
- `Code generation (Kadane algorithm python).md`: contains an example note about the Kadane algorithm. The Python code is incomplete. The plugin should be able to complete the code.
- `Code generation (Kadane algorithm rust).md`: contains an example note about the Kadane algorithm. The Rust code is incomplete. The plugin should be able to complete the code.
- `Code generation (Kadane algorithm typescript).md`: contains an example note about the Kadane algorithm. The Typescript code is incomplete. The plugin should be able to complete the code.
- `Javascript code completion test (fizz buzz).md`: contains an example note about the fizz buzz problem. The Javascript code is incomplete. The plugin should be able to complete the code.
- `List completion in the middle (missing solid principles).md`: contains an example note about the SOLID design principles. The list of principles is incomplete. The plugin should be able to complete the list.
- `List completion test (dead relu reasons).md`: contains an example note about the dead ReLU problem. The possible reasons for the dead ReLU problem are missing. The plugin should be able to complete the list of reasons.
- `Math block test (softmax math function).md`: contains an example note about the softmax function. The latex code is for the softmax function is missing. The plugin should be able to complete the latex code based on the notes description and Python code.
- `Python code completion test ( random pillow image).md`: contains an example note about the random pillow image. The Python code is incomplete. The plugin should be able to complete the code.
- `Python code completion test (fizz buzz).md`: contains an example note about the fizz buzz problem. The Python code is incomplete. The plugin should be able to complete the code.
- `task completion test (sub tasks todo list new york).md`: contains an example note about packing a todo list for a trip to New York. The todo list is incomplete. The plugin should be able to complete the todo list.
- `task completion test (tasks todo list new york).md`: contains an example note about packing a todo list for a trip to New York. The todo list is incomplete. The plugin should be able to complete the todo list.
- `Text completion test (Discreet Fourier transform).md`: contains an example note about the Discreet Fourier transform. The latex code for the Discreet Fourier transform is incomplete. The plugin should be able to complete the latex code based on the notes description and Python code.
- `Text completion test (git sha hash checksums).md`: contains an example note about git sha hash. The plugin should be able to complete the paragraph about git sha hash.
- `Title test (adapter design pattern).md`: contains an example note about the adapter design pattern. The plugin should be able to complete the title.
- `Title test (dutch bitcoin).md`: contains an example note about the Dutch bitcoin. The plugin should be able to complete the title in Dutch.
