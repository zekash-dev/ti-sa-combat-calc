import { Participant, Outcome, ParticipantRole } from "model/common";

export function calculateCombatOutcome(attacker: Participant, defender: Participant): Outcome[] {
    return [
        {
            propability: 0.5,
            victor: ParticipantRole.Attacker,
        },
    ];
}
