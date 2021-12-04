import { calculateCombatOutcome } from "logic/calculator";
import { CalculationInput, CalculationOutput } from "model/calculation";

export function runCalculationWorker(input: CalculationInput): CalculationOutput {
    return calculateCombatOutcome(input);
}
