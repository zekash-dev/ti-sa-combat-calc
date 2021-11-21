import { sum } from "lodash";

import { Outcome, Participant, ParticipantRole } from "model/common";

export function calculateCombatOutcome(attacker: Participant, defender: Participant): Outcome[] {
    const attackerShipCount: number = sum(Object.values(attacker.units));
    const defShipCount: number = sum(Object.values(defender.units));

    if (attackerShipCount === 0 && defShipCount === 0) return [];

    const victoryChance = attackerShipCount / (attackerShipCount + defShipCount);
    return [
        {
            propability: victoryChance,
            victor: ParticipantRole.Attacker,
        },
        {
            propability: 1 - victoryChance,
            victor: ParticipantRole.Defender,
        },
    ];
}
