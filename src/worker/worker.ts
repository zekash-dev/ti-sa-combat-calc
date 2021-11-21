import { calculateCombatOutcome } from "logic/calculator";
import { Participant, OutcomeInstance } from "model/common";

export function runCalculationWorker(attacker: Participant, defender: Participant): OutcomeInstance[] {
    return calculateCombatOutcome(attacker, defender);
}
