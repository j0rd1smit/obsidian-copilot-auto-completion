import { PredictionService } from "./types";
import { Settings } from "../settings/settings";

class ConstantPredictionService implements PredictionService {
    private readonly prediction: string;

    constructor(prediction: string) {
        this.prediction = prediction;
    }

    async fetchPredictions(prefix: string, suffix: string): Promise<string> {
        return this.prediction;
    }

    static fromSettings(settings: Settings): PredictionService {
        return new ConstantPredictionService("$$\nhello world\n$$");
        // return new ConstantPredictionService("hello world");
    }
}

export default ConstantPredictionService;
