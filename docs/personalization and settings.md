# Personalization and settings
The plugin has been designed to be highly customizable. 
You can customize the following aspects of the plugin.

## Triggers
The plugin has default triggers such as:
- End of sentence: `.` `!` `?`
- End of the line: `\n`
- List or task items.
- etc.

If you prefer different triggers, you edit or remove the default triggers or add your own.
To do this, go to the settings and triggers section.
If you press the `+` button, you can add a new trigger.
You must decide if each trigger is a string or a regex trigger.
If you select string, the plugin will check if the prefix ends with this specific string.
If you select regex, the plugin will check if the prefix matches the regex.
Do not forget to add the end-of-line symbol (`$`) for the regex triggers. Else you might match in the middle of the prefix.
Also, be aware that more trigger-happy triggers can result in more API calls and, thus, higher costs.

## Trigger delay
The trigger delay is the amount of time the plugin stays in the queueing state before going to the predicting state.
This delay prevents the plugin from making too many API calls by automatically canceling the prediction request if the user continues typing.
You can configure this delay in the settings.
Increasing this delay will reduce the number of API calls but will also make the plugin feel less responsive.
So you should find a balance between these two factors that works for you.

## Model options
The LLM models also have certain hyperparameters that can be tuned.
For example, you are free to change the following parameters:
- `temperature`: Controls randomness. Lower temperatures result in more repetitive and deterministic responses. Higher temperatures will result in more unexpected or creative responses.
- `top_p`: Like the temperature, lowering Top P will limit the model's token selection to likelier tokens. Increasing Top P expands the model's token selection with lower likelihood tokens.
- `max_tokens`: The maximum number of tokens the model is allowed to generate. This includes the chain of thought tokens before the answer.
- `presence_penalty`: Reduce the chance of repeating any token that has appeared in the text so far. This increases the likelihood of introducing new topics in a response.
- `frequency_penalty`: Reduce the chance of repeating a token proportionally based on how often it has appeared in the text so far. This decreases the likelihood of repeating the exact same text in a response.

These parameters allow you to customize the model's creativity and reliability.
Feel free to experiment with these parameters to find the best settings for you.

## Preprocessing
Before the text is sent to the API provider, the plugin will do some preprocessing.
This typically involves removing some text that is not relevant to the API provider.
The most important thing here is the number of characters in the prefix and suffix that you want to include in the prediction request.
These settings will truncate the prefix to the last `n` characters and the suffix to the first `m` characters.
Especially for large documents, this can significantly reduce inference time and costs.
However, if you set these values too low, the model might not have enough context to generate a good response.
So you should find a balance between these two factors that work for you.

## Advanced configuration
For advanced users, we also provide the option to customize the prompt engineering aspects of the plugin.
These settings are hidden by default, but you can make them visible by enabling the advanced model setting.
Feel free to experiment with these settings to find the best ones for you.
If you mess up the settings, you can always reset them using the factory reset button to the default values.
Be aware that this will reset all the settings to the default values.
So ensure you have a backup of your settings if you want to keep them.

### Customize the system prompts
The [model](./how does the model work in details.md) section shows the default system prompts.
This prompt is fully customizable.
Feel free to experiment with this prompt to find the best settings for you.
However, be aware that you must make it consistent with the following settings:
- Few shot examples (See Customize the few shot examples section bellow.)
- Chain-of-thought removal regex: This regex removes all the non-answer-related text from the response. If this is not done correctly, you might get unexpected text in your suggestions.
- User message template: This template is used to generate the user message that is shown in the suggestion. It determines how the prefix, mask, and suffix are combined into a single message.

![system_prompt](../assets/system_message_settings.jpg)

### Customize the few shot examples
In the [model](#model) section, we have shown how the few shot examples are used to improve the model's predictions.
These examples are fully customizable.
You can add examples by pressing the `+` button (red rectangle).
You can remove examples by pressing the `x` button (blue rectangle).
An example consists of 3 parts:
- **Context** (yellow rectangle): This is the context in which examples should be used. The plugin uses this to determine when to use this example. The example will not be used if the cursor is not in this context.
- **Human message**: This is the input we want to give the model. This is an example document with text before and after `<mask/>`.
- **Assist message**: This is an example answer of a suitable response. This answer should be consistent with the system prompt and the chain-of-thought removal regex.

![few_shot_examples](../assets/few_shot_example_settings.jpg)
