export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(
    obj: O
): K[] {
    return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

export function generateRandomString(n: number): string {
    let result = '';
    const characters = '0123456789abcdef';

    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

