# Changelog

## 1.1.0  
- Added the ability to exclude specific files and folders using glob patterns. Users can now define a list of glob patterns in the settings, and the extension will automatically disable or enable when switching between files.
- Refactored the internal mechanisms of the settings management to increase flexibility and facilitate migrations to new settings schemas.
- Added a note suggesting that caching can enhance performance and reduce API calls. If you accidentally dismiss a suggestion or press an incorrect key, simply resume typing, and the suggestion will reappear.
- Typing the next character in a suggestion will no longer dismiss it. Instead, the suggestion will automatically update to show the remaining part of the suggestion, excluding the character you just typed.
- Fixed a bug that could cause the suggestion box to render outside the boundaries of the editor.
- Added support for [Ollama](https://ollama.ai/) as a local API provider.
- Improve language detection. The plugin should now more often write responses in the same language as the text around the cursor. If you customize the few shot examples or system prompt, you might need to press the factory reset to get the updated settings. If you have not customized it, it will update automatically.
- Improve default few shot examples and system prompt. They are now shorter and more focused on the reasoning, resulting in better and faster suggestions. If you customize the few shot examples or system prompt, you might need to press the factory reset to get the updated settings. If you have not customized it, it will update automatically.
- Add guides for how to configure the extension for different API providers and how to get the needed API keys.

## 1.0.7
- If a prediction fails, the full exception is now logged to the console. Allowing users to investigate the issue further.

## 1.0.6
- Make the api base url for openai configurable for local models in the settings.

## 1.0.5
- Add the ability to change openai models, allowing you to select other openai chat models such as GPT-4.

