import { ChatMessage, ModelOptions } from "./types";

export async function queryChatModel(
    url: string,
    apiKey: string,
    messages: ChatMessage[],
    modelOptions: ModelOptions
): Promise<ChatMessage> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({ messages, ...modelOptions }),
    });

    const data = await response.json();

    return data.choices[0].message;
}
