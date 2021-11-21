import { calculateCombatOutcome } from "logic/calculator";
import { Participant, Outcome } from "model/common";

export function runCalculationWorker(attacker: Participant, defender: Participant): Outcome[] {
    return calculateCombatOutcome(attacker, defender);
}
