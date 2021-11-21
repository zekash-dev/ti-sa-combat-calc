import { round, sum } from "lodash";

import { KeyedDictionary, Outcome, Participant, ParticipantRole, UnitType } from "model/common";

export function calculateCombatOutcome(attacker: Participant, defender: Participant): Outcome[] {
    const attackerShipCount: number = sum(Object.values(attacker.units));
    const defShipCount: number = sum(Object.values(defender.units));

    if (attackerShipCount === 0 && defShipCount === 0) return [];

    const victoryChance = attackerShipCount / (attackerShipCount + defShipCount);
    return [
        {
            probability: victoryChance,
            victor: ParticipantRole.Attacker,
            hits: calculateHits(attacker),
        },
        {
            probability: 1 - victoryChance,
            victor: ParticipantRole.Defender,
            hits: calculateHits(defender),
        },
    ];
}

function calculateHits(participant: Participant): number[] {
    let hitChances: number[] = [1.0]; // Initial probability: 100% chance for 0 hits.
    for (let unitType of Object.keys(participant.units)) {
        const unitCount: number | undefined = participant.units[unitType as UnitType];
        if (unitCount) {
            const hitProbability: number = baseCombatValues[unitType as UnitType] / 10;
            for (let i = 0; i < unitCount; i++) {
                hitChances = addHitChance(hitChances, hitProbability);
            }
        }
    }
    return hitChances;
}

function addHitChance(hitChances: number[], hitProbability: number): number[] {
    const nextHitChances: number[] = [];
    for (let i = 0; i <= hitChances.length; i++) {
        nextHitChances[i] =
            // Probability that we had (i) hits and this roll didn't hit
            (hitChances[i] ?? 0) * (1 - hitProbability) +
            // Probability that we had (i-1) hits and this roll hit
            (hitChances[i - 1] ?? 0) * hitProbability;
    }
    return nextHitChances;
}

const baseCombatValues: KeyedDictionary<UnitType, number> = {
    fighter: 2,
    destroyer: 2,
};

export function calculateAverageHits(hitChances: number[]): number {
    return round(
        hitChances.reduce((prev, curr, i) => prev + curr * i, 0),
        2
    );
}
