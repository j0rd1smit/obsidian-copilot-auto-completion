# Setting Up the OpenAI API

## Preparing Your OpenAI Account
1. Navigate to the [OpenAI API website](https://platform.openai.com).
2. Sign in to your existing OpenAI account or create a new one if necessary.
3. Ensure that your payment details are entered and current.

## Obtaining OpenAI API Keys
1. Navigate to the [OpenAI API website](https://platform.openai.com).
2. Select the `API Keys` tab from the left-hand menu.
3. Click the `+ Create new secret key` button.
4. Store the generated API key securely.

## Configuring the Plugin
1. Open the Obsidian vault where this plugin is installed.
2. Access the settings for this plugin.
3. In the API Provider setting, choose `OpenAI` to update the API settings view.
4. Paste the API key you copied earlier into the `OpenAI API key` field.
5. Confirm that the `OpenAI API URL` field is set to `https://api.openai.com/v1/chat/completions`.
6. Test the connection by clicking the `Test Connection` button to ensure the API key is correct and the plugin can connect to the OpenAI API.
7. Exit the settings window.
8. The plugin is now ready for use. Begin typing, and upon reaching a trigger, such as the end of a sentence, the plugin will offer suggestions. Or manually trigger the plugin by opening the command palette and typing `Copilot auto completion: Predict`.

