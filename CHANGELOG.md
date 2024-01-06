# Changelog

## 1.1.0
- Add the ability to ignore certain files and folder based on glob patterns. Users can now specify a list of glob patterns in the settings, and the extension will temporarily auto-disable while you are working on that file.
- Refactored the inner workings of the settings management to allow for more flexibility and migrations to new setting schemas.

## 1.0.7
- If a prediction fails, the full exception is now logged to the console. Allowing users to investigate the issue further.

## 1.0.6
- Make the api base url for openai configurable for local models in the settings.

## 1.0.5
- Add the ability to change openai models, allowing you to select other openai chat models such as GPT-4.

