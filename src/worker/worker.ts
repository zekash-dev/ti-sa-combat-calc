import { calculateCombatOutcome } from "logic/calculator";
import { simulateCombat } from "logic/simulator";
import { Participant, OutcomeInstance, SimulatedCombatResult, CombatParticipant } from "model/common";

export function runCalculationWorker(attacker: Participant, defender: Participant): OutcomeInstance[] {
    return calculateCombatOutcome(attacker, defender);
}

export function runSimulationWorker(attacker: CombatParticipant, defender: CombatParticipant, iterations: number): SimulatedCombatResult[] {
    return simulateCombat(attacker, defender, iterations);
}
