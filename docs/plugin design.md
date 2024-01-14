# Plugin design
The plugin has been designed to minimize the number of API calls.
It does this using an intelligent queueing and trigger detection system.
This system can quickly become quite complex, so it has been designed using a [state machine](https://refactoring.guru/design-patterns/state).
In the bottom right corner of the Obsidian window, you can see the current state of the plugin. 
The plugin is always in one of the following states:
- **Idle**: The plugin is enabled, waiting for a trigger.
- **Queued**: The plugin has detected a trigger and is waiting for the trigger delay to expire before going to the predicting state.
- **Predicting**: The plugin requests a prediction from the API provider. 
- **Suggesting**: The plugin shows the prediction suggestion and waits for the user to accept or reject it.
- **Disabled**: The plugin is disabled, preventing it from reacting to any trigger.

The queueing state is the most important state for minimizing the number of API calls since it prevents the plugin from making undesired API calls in the prediction state. This is important since your API provider will bill you for all API calls made, even if you don't use the suggestion that comes out of it.
You can minimize these costs by configuring how long the plugin stays queued.
Increasing this delay will reduce the number of API calls but will also make the plugin feel less responsive.
So you should find a balance between these two factors that works for you.

The relationship and transitions between the states are shown in the following diagram:
![states](assets/state_diagram.jpg)

