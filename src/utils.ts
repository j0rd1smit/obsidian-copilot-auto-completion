import * as crypto from "crypto";

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(
    obj: O
): K[] {
    return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

export function generateRandomString(n: number): string {
    return crypto.randomBytes(n).toString("hex");
}
