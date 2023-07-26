# Obsidian Sample Plugin
This plugin adds a copilot like auto-completion to oObsidian.
It uses the OpenAI API or Azure OpenAi API to generate text based on the X characters before and after your cursor.
It will offer you a completion suggestion transparent text.
You can then press tab to insert the suggestion or press escape or move the cursor to cancel it.

![demo](assets/demo.gif)

## Usage
When you are writing, the plugin watches if the text before your cursor matches any of the trigger words or regex.
If it does, it will queue a prediction request. 
If you move the cursor, change the document, or press escape, the plugin will cancel the prediction request.
Prediction requests will be queued for a certain amount of time, this to prevent excessive API calls.
Once the prediction request is done, the plugin will show the suggestion in a transparent text.
You can accept it by pressing tab or using the `Obsidian Copilot: Accept` quick action. 
If you press escape, move the cursor or change the document, the suggestion will be canceled.

Sometimes, you might want to force a prediction request at a certain location in the document.
In theory, you can do this by adding a trigger rule that will always match but this can become quite costly.
Instead, you can use the `Obsidian Copilot: Predict` quick action.
The plugin will directly make a prediction request and show the suggestion.
![prediction_quick_action](assets/type_hint_prediction.gif | width=100)

If you are working a privacy-sensitive document, you might not want to share its content with the API provider.
To prevent this, you can temporarily disable the plugin. 
The easiest way to do this is to use one of the quick actions.
Open the command palette (`CMD + P` on Mac or `CTRL + P` on windows) and search for `Obsidian Copilot: Disable`, this will put the plugin in the disabled state.
The plugin will now ignore all triggers and will not send any text to the API provider.
The plugin will stay in this state until you enable it again, even if you close and reopen the Obsidian.
When you want to enable the plugin again, you can use the `Obsidian Copilot: Enable` quick action.

![disable](assets/disable_quick_action.jpg)


## Installation
After installing the plugin, you need to configure your API provider.
You can do this as follows:
1. Go to the plugin settings.
2. Ensure that you installed this plugin and have enabled it under "Community plugins" settings.
3. Go to the `Obsidian Copilot` settings.
4. Select your API provider.
5. If you selected the OpenAI API, you need to provide your API key. 
6. If you selected the Azure OpenAI API, you need to provide your API key and endpoint. 
7. Click on the test connection button to verify that the plugin can connect to the API provider. If the test fails, check your API key and endpoint.
8. Close the settings window.
9. You are now ready to use the plugin.

![settings](assets/settings_demo.gif)

## How does it work?

### Model
The prediction task has been formulated as mask replacement task.
Using prompt engineering, we can make a Chat-LLM model perform this task.
To do this we use the following system prompt:

```text
Your job is to predict the most logical text that should be written at the location of the <mask/>.
Your answer can be either code, a single word, or multiple sentences.
Your answer must be in the same language as the text that is already there.
Your response must have the following format:
THOUGHT: here you explain your reasoning of what could be at the location of <mask/>
ANSWER: here you write the text that should be at the location of <mask/>
```

We then provide the model with the (truncate) text before and after the cursor in the format `<truncate_text_before_cursor> <mask/> <truncate_text_after_cursor>`.
For example, the user message to the model for the Attention formula in the example above would be:
```text
Weighted average of (sequence) elements, with the weights dynamically computed based on an input query and elements' keys. 

The attention weight $a_i$ is calculated as follows:
$$
<mask/>
$$

In this formula we have the following components:
- Value: For each element, we have a feature vector per element we want to average over.
- Score function  $f_{score}(key, query)$: uses the queries and keys to calculate the weights per value. (Typically a simple similarity metric or MLP.)
- Attention weight $\alpha_i$: the amount of attention to put on value $i$.
```
The model then responses with something like:
```text
THOUGHT: The </mask> is located in a math block. The text before the mask is explaining the attention weight calculation. Based on the text, my answer should be the formula for calculating the attention weight using the score function. 
ANSWER: \alpha_i = \frac{\exp(f_{score}(key_i, query))}{\sum_j \exp(f_{score}(key_j, query))}
```
The thought part helps the model to reason about the task and focuses the attention mechanism on the relevant parts of the text.
However, the thought part is not very useful for the user.
So, we remove this part and show only show the answer part to the user as a suggestion.

As you can see the above example, the model only has access to the text in the current document.
This prevents the model from leaking information from other documents, that might be privacy-sensitive.

### Context aware few shot examples
The above model setup works already quite well, but it can be improved by using context aware few shot examples.
The key idea here is that expect specific types of answers at specific locations in the document.
For example:
- In a math block, we expect a latex formula.
- In a code block, we expect code in the same language as the code block.
- In a list, we expect a new list item.
- In a heading, we expect a new heading that representative of the content of the paragraph.
- In a paragraph, we expect a new sentence that is consistent with the text around it.
- etc.

You can probably think of many more examples and rules.
As a result, the system prompt can become long and complex.
To prevent this, it easier to give the model some example input and output pairs.
They implicitly show the model what you expect in the response for given context.
For example, in a math block, we can give the model the following example.

Input:
```text
# Sample mean
The sample mean, or sometime called average, is defined as:

$$
sample_mean(x) = <mask/>
$$
The average value has the property that 50% of the weighted* value will be above and below it. This weighted property can make it more sensitive to outliers than the median.
```

Output:
```text
THOUGHT: The </mask> is located in math block. Based on the text before and after the mask my answer should be the latex formula for the sample mean. 
ANSWER: \frac{1}{n} \sum_i^n x_i
```

This example is math block specific, so this example will only be included if the cursor is in a math block.
We do support a wide range of contexts such as:
- Math blocks;
- Code blocks;
- Numbered lists;
- Unordered/bullet lists;
- Task lists;
- Headings;
- Normal text;
- Block quotes;
- etc.

You can find all the examples under the advanced settings.
You can also add your own examples or customize the existing ones.
This way you tell the model about your specific writing style and expectations.
See the [advanced settings](#advanced-configuration) section for more information.

### Plugin design
The plugin has been designed to minimize the number of API calls.
It does this using a smart queueing and trigger detection system.
This system can quickly become quite complex, so it has been designed using a [state machine](https://refactoring.guru/design-patterns/state).
In the bottom right corner of the Obsidian window you can see the current state of the plugin. 
The plugin is always in one of the following states:
- **Idle**: The plugin is enabled waiting for a trigger.
- **Queued**: The plugin has detected a trigger and is waiting for the trigger delay to expire before going to the predicting state.
- **Predicting**: The plugin is requesting a prediction from the API provider.
- **Suggesting**: The plugin is showing the prediction suggestion, and is waiting for the user to accept or reject it.
- **Disabled**: The plugin is disabled and will react to any trigger.

The queueing state is the most important state for minimizing the number of API calls.
You can configure how long the plugin should wait in this state before going to the predicting state in the settings.
Increasing this delay will reduce the number of API calls, but will also make the plugin feel less responsive.
So you should a balance between these two factors that works for you.

The relationship and transitions between the states is shown in the following diagram:
![states](assets/state_diagram.jpg)


## Personalization and settings
The plugin has been designed to be highly customizable. 
You can customize the following aspects of the plugin.

### Triggers
The plugin has default triggers such as:
- End of sentence: `.` `!` `?`
- End of line: `\n`
- List or task items.
- etc.

If you prefer different triggers, you edit or remove the default triggers or even add your own.
To do this got the settings and go to the triggers section.
If press the `+` button you can add a new trigger.
For each trigger you must decide if it is a string or a regex trigger.
If you select string, the plugin will check if the prefix ends with this specific string.
If you select regex, the plugin will check if the prefix matches the regex.
For the regex triggers, do not forget to add the end of line symbol (`$`) else you might match in the middle of the prefix.
Also, be aware that more trigger-happy triggers can result in more API calls and thus higher costs.

### Trigger delay
The trigger delay is the amount of time the plugin stays in the queueing state before going to the predicting state.
This delay is used to prevent the plugin from making too many API calls, by automatically cancelling the prediction request if the user continues typing.
You can configure this delay in the settings.
Increasing this delay will reduce the number of API calls, but will also make the plugin feel less responsive.
So you should a balance between these two factors that works for you.

### Model options
The LLM models also have certain hyperparameters that can be tuned.
For example, you are free to change the following parameters:
- `temperature`: Controls randomness. Lower temperatures result in more repetitive and deterministic responses. Higher temperatures will result in more unexpected or creative responses.
- `top_p`: Like the temperature, lowering Top P will limit the model’s token selection to likelier tokens. Increasing Top P expand the models token selection with lower likelihood tokens.
- `max_tokens`: The maximum number of tokens the model is allowed to generate. This includes the chain of thought tokens before the answer.
- `presence_penalty`: Reduce the chance of repeating any token that has appeared in the text so far. This increases the likelihood of introducing new topics in a response.
- `frequency_penalty`: Reduce the chance of repeating a token proportionally based on how often it has appeared in the text so far. This decreases the likelihood of repeating the exact same text in a response.

These parameters allow you to customize the models creativity and reliability.
Feel free to experiment with these parameters to find the settings that work best for you.

### Preprocessing
Before the text is sent to the API provider, we can do some preprocessing.
This typically involves removing some text that is not relevant for the API provider.
The most import thing here is the number of characters in the prefix and suffix that you want to include in the prediction request.
These settings will truncate the prefix to the last `n` characters and the suffix to the first `m` characters.
Especially, for large documents this can significantly reduce the inference time and costs.
However, if you set these values too low, the model might not have enough context to generate a good response.
So you should a balance between these two factors that works for you.

### Advanced configuration
For advanced users, we also provide the option to customize the prompt engineering aspects of the plugin.
By default, these settings are hidden, but you can make them visible by enabling the advanced model setting.
Feel free to experiment with these settings to find the settings that work best for you.
If you ever mess up the settings, you can always reset them to the default values using the factory reset button.
Be aware that this will reset all the settings to the default values.
So make sure you have a backup of your settings if you want to keep them.

#### Customize the system prompts
The default system prompts is show in the [model](#model) section.
This prompt is fully customizable.
Feel free to experiment with this prompt to find the settings that work best for you.
However, be aware that you must make it consistent with following settings:
- [Few shot examples](#customize-the-few-shot-examples)
- Chain-of-thought removal regex: This regex is used to remove all the non-answer related text from the response. If this is not done correctly, you might get unexpected text in your suggestions.
- User message template: This template is used to generate the user message that is shown in the suggestion. It determines how tha prefix, mask and suffix are combined into a single message.

![system_prompt](assets/system_message_settings.jpg)

#### Customize the few shot examples
In the [model](#model) section, we have shown how the few shot examples are used to improve the model predictions.
These examples are fully customizable.
You can add additional examples by pressing the `+` button (red rectangle).
You can remove examples by pressing the `x` button (blue rectangle).
An example consists of 3 parts:
- **Context** (yellow rectangle): This is the context in which examples should be used. The plugin uses this to determine when to use this example. If the cursor is not in this context, the example will not be used.
- **Human message**: This is the input we want to give to the model. This is an example document with some text before and after `<mask/>`.
- **Assist message**: This is an example answer of a suitable response. This answer should be consistent with the system prompt and the chain-of-thought removal regex.

![few_shot_examples](assets/few_shot_example_settings.jpg)


## Local development
To develop the plugin locally, you can follow the following steps:

1. Go to your (development) obsidian vault.
2. Find the dot files folder with all the configs. Typically name `.obsidian`
3. Go to the plugin folder here. This is typically named `plugins`. If you have not installed any plugins yet, this folder might not exist yet.
4. Clone the project here using: `git clone https://github.com/j0rd1smit/obsidian-copilot`
5. Navigate into the newly create obsidian-copilot folder using: `cd obsidian-copilot`
6. Install the dependencies using: `npm install`
7. Run the build script using: `npm run dev`. This will watch the files and automatically rebuild the plugin when you make changes.
8. Restart obsidian to load the plugin. You can also use the `reload app without saving` action to reload the Obisidian app without closing it.
9. Go to the community plugins and enable obsidian-copilot.
10. Go to the obsidian-copilot settings and add the needed secrets.

You can now make changes to the plugin and see them reflected in the Obsidian app.
Feel free to make a pull request if you think your changes are useful for others.
