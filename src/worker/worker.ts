import { calculateCombatOutcome } from "logic/calculator";
import { simulateCombat } from "logic/simulator";
import { SimulatedCombatResult, CombatParticipant, CalculationInput, CalculationOutput } from "model/common";

export function runCalculationWorker(input: CalculationInput): CalculationOutput {
    return calculateCombatOutcome(input);
}

export function runSimulationWorker(attacker: CombatParticipant, defender: CombatParticipant, iterations: number): SimulatedCombatResult[] {
    return simulateCombat(attacker, defender, iterations);
}
