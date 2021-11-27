import { round, sum } from "lodash";

import {
    AggregatedOutcome,
    CombatRoundInput,
    KeyedDictionary,
    OutcomeInstance,
    Participant,
    ParticipantRole,
    UnitType,
} from "model/common";

export function calculateCombatOutcome(attacker: Participant, defender: Participant): OutcomeInstance[] {
    const attackerShipCount: number = sum(Object.values(attacker.units));
    const defShipCount: number = sum(Object.values(defender.units));

    if (attackerShipCount === 0 && defShipCount === 0) return [];

    const outcomes: OutcomeInstance[] = runCombatRound({
        attacker,
        defender,
        combatRound: 1,
        initAttackerHits: 0,
        initDefenderHits: 0,
        initProbability: 1.0,
    });

    // const aggregates: AggregatedOutcome[] = aggregateOutcomes(outcomes);
    return outcomes;
}

function runCombatRound(input: CombatRoundInput): OutcomeInstance[] {
    const outcomes: OutcomeInstance[] = [];
    const attackerHits: number[] = calculateHits(input.attacker);
    const defenderHits: number[] = calculateHits(input.defender);
    for (let att = 0; att < attackerHits.length; att++) {
        for (let def = 0; def < defenderHits.length; def++) {
            const probability: number = input.initProbability * attackerHits[att] * defenderHits[def];
            if (probability < PROBABILITY_BREAKPOINT) continue;

            const nextAttacker: Participant = assignHits(input.attacker, def);
            const nextDefender: Participant = assignHits(input.defender, att);
            let victor: ParticipantRole | null | undefined = undefined; // todo: better differentiation between draw and continuation
            if (!hasUnits(nextAttacker)) {
                if (!hasUnits(nextDefender)) {
                    victor = null;
                } else {
                    victor = ParticipantRole.Defender;
                }
            } else if (!hasUnits(nextDefender)) {
                victor = ParticipantRole.Attacker;
            }
            if (victor !== undefined) {
                outcomes.push({
                    probability,
                    victor,
                    combatRounds: input.combatRound,
                    attackerHits: input.initAttackerHits + att,
                    defenderHits: input.initDefenderHits + def,
                });
            } else {
                outcomes.push(
                    ...runCombatRound({
                        attacker: nextAttacker,
                        defender: nextDefender,
                        initProbability: probability,
                        initAttackerHits: input.initAttackerHits + att,
                        initDefenderHits: input.initDefenderHits + def,
                        combatRound: input.combatRound + 1,
                    })
                );
            }
        }
    }
    return outcomes;
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

function assignHits(participant: Participant, hits: number): Participant {
    // todo: need to handle hit sources
    let next: Participant = participant;
    for (let i = 0; i < hits; i++) {
        for (let unitType of Object.keys(participant.units)) {
            const unitsOfType: number | undefined = participant.units[unitType as UnitType];
            if (unitsOfType !== undefined && unitsOfType > 0) {
                next = {
                    ...next,
                    units: {
                        ...next.units,
                        [unitType as UnitType]: unitsOfType - 1 < 1 ? undefined : unitsOfType - 1,
                    },
                };
            }
        }
    }
    return next;
}

function hasUnits(participant: Participant): boolean {
    return Object.keys(participant.units).some((unitType: string) => !!participant.units[unitType as UnitType]);
}

export function aggregateOutcomes(outcomes: OutcomeInstance[]): AggregatedOutcome[] {
    const aggregates: AggregatedOutcome[] = [];
    for (let outcome of outcomes) {
        let aggregate: AggregatedOutcome | undefined = aggregates.find(
            (agg) => agg.victor === outcome.victor && agg.combatRounds === outcome.combatRounds
        );
        if (!aggregate) {
            aggregate = {
                probability: 0.0,
                victor: outcome.victor,
                combatRounds: outcome.combatRounds,
                avgAttackerHits: 0.0,
                avgDefenderHits: 0.0,
            };
            aggregates.push(aggregate);
        }
        aggregate.probability += outcome.probability;
        aggregate.avgAttackerHits += outcome.probability * outcome.attackerHits;
        aggregate.avgDefenderHits += outcome.probability * outcome.defenderHits;
    }
    for (let aggregate of aggregates) {
        aggregate.avgAttackerHits /= aggregate.probability;
        aggregate.avgDefenderHits /= aggregate.probability;
    }
    return aggregates;
}

export function calculateAverageHits(hitChances: number[]): number {
    return round(
        hitChances.reduce((prev, curr, i) => prev + curr * i, 0),
        2
    );
}

const baseCombatValues: KeyedDictionary<UnitType, number> = {
    fighter: 2,
    destroyer: 2,
    cruiser: 4,
    dreadnought: 6,
    warSun: 8,
    carrier: 2,
};

const PROBABILITY_BREAKPOINT: number = 0.000001;
