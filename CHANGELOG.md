# Changelog

## 1.1.0  
- Added the ability to exclude specific files and folders using glob patterns. Users can now define a list of glob patterns in the settings, and the extension will automatically disable or enable when switching between files.
- Refactored the internal mechanisms of the settings management to increase flexibility and facilitate migrations to new settings schemas.
- Added a note suggesting that caching can enhance performance and reduce API calls. If you accidentally dismiss a suggestion or press an incorrect key, simply resume typing and the suggestion will reappear.
- Typing the next character in a suggestion will no longer dismiss it. Instead, the suggestion will automatically update to show the remaining part of the suggestion, excluding the character you just typed.
- Fixed a bug that could cause the suggestion box to render outside the boundaries of the editor.
- Added support for [Ollama](https://ollama.ai/) as a local API provider.

## 1.0.7
- If a prediction fails, the full exception is now logged to the console. Allowing users to investigate the issue further.

## 1.0.6
- Make the api base url for openai configurable for local models in the settings.

## 1.0.5
- Add the ability to change openai models, allowing you to select other openai chat models such as GPT-4.

