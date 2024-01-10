import {requestUrl} from "obsidian";
import {err, ok, Result} from "neverthrow";

export async function makeAPIRequest(url: string, method: string, body: object, headers: Record<string, string> | undefined = undefined): Promise<Result<any, Error>> {
    try {
        if (headers === undefined) {
            headers = {
                "Content-Type": "application/json",
            };
        }

        const response = await requestUrl({
            url: url,
            method: method,
            body: JSON.stringify(body),
            headers,
            throw: false,
            contentType: "application/json",
        });

        if (response.status >= 500) {
            return err(new Error("API returned status code 500. Please try again later."));
        }

        if (response.status >= 400) {
            let errorMessage = `API returned status code ${response.status}`;
            if (response.json && response.json.error && response.json.error.message) {
                errorMessage += `: ${response.json.error.message}`;
            }
            return err(new Error(errorMessage));
        }

        return ok(response.json);

    } catch (error) {
        return err(error)
    }
}
