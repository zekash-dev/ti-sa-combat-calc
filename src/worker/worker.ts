import * as Comlink from "comlink";

import { calculateCombatOutcome } from "logic/calculator";
import { CalculationInput, CalculationOutput } from "model/calculation";

export function runCalculationWorker(input: CalculationInput): CalculationOutput | null {
    return calculateCombatOutcome(input);
}

Comlink.expose({
    runCalculationWorker,
});
