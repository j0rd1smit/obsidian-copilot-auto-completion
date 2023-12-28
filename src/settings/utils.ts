import {Settings, settingsSchema} from "./versions";
import { z } from 'zod';

export function checkForErrors(settings: Settings) {
    const errors = new Map<string, string>();

    try {
        settingsSchema.parse(settings);
    } catch (error) {
        if (!(error instanceof z.ZodError)) {
            throw error;
        }
        // Transform ZodError into a Map for compatibility with UI.
        for (const issue of error.issues) {
            errors.set(issue.path.join('.'), issue.message);
        }
    }

    return errors;
}

export function hasSameAttributes(target: any, reference: any): boolean {
  const keysB = Object.keys(reference);

  return keysB.every(key => {
    if (typeof reference[key] === 'object' && typeof target[key] === 'object') {
      return hasSameAttributes(target[key], reference[key]);
    }
    return key in target;
  });
}
