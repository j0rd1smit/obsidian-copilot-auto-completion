# Ollama Setup Guide  
As of the time of writing, [Ollama](https://ollama.ai/) supports only macOS and Linux. Support for Windows is planned for future releases.  
   
## Installing Ollama  
1. Navigate to the [Ollama website](https://ollama.ai/).  
2. Click on the `Download` button.  
3. Follow the provided installation instructions.  
   
## Downloading Local Models  
Ollama offers a variety of pre-trained models for download to use locally. These files are quite large, ranging from 4 to 16 GB, so ensure you have sufficient disk space and a reliable internet connection before proceeding. Here are the steps to download a model:  
1. Visit the [Ollama model library](https://ollama.ai/library).  
2. Choose a model to download. Currently, `mistral` is among the better models. Note: Additional model options are available under the `Tag` tab on the model's page.  
3. Confirm that the Ollama application is open.  
4. Open a terminal and execute the command: `ollama pull <model-name>`.
5. Allow time for the download to complete, which will vary based on your internet speed.  
6. Verify the model's functionality by running: `ollama run <model-name> "Tell me a joke about auto-complete."` You should receive a response similar to:  
   
```text  
> ollama run mistral "Tell me a joke about auto-complete."  
 Why did the text editor's auto-complete feature feel superior?  
   
Because it had a lot of "self-confidence."  
   
(This joke may resonate more with programmers and tech enthusiasts.)  
```

## Configuring the Plugin  
1. Open the Obsidian vault where the plugin is installed.  
2. Go to the plugin's settings.  
3. Select `Self-hosted Ollama API` in the API Provider setting to update the view with the API settings.  
4. Verify that the API URL is set correctly. The default should be `http://localhost:11434/api/chat`.  
5. Enter the downloaded model's name in the designated field.  
6. Click the `Test Connection` button to confirm the API key's validity and the plugin's ability to connect to the Ollama API.  
7. Close the settings window.  
8. With the setup complete, the plugin is ready for use. It will offer suggestions as you type, triggered at specific points such as the end of a sentence, or you can manually activate it by using the command palette and entering `Copilot auto-completion: Predict`.

Note: If Ollama does not automatically start up the API server, you can manually start it by running `ollama serve` in a terminal.
