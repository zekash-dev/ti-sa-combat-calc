import { cloneDeep, Dictionary, groupBy, max, random } from "lodash";

import {
    AggregatedCombatResult,
    CombatParticipant,
    CombatUnit,
    CombatVictor,
    HitType,
    KeyedDictionary,
    ParticipantRole,
    RolledHit,
    SimulatedCombat,
    SimulatedCombatResult,
    UnitDefinition,
    UnitType,
} from "model/common";

export function simulateCombat(attacker: CombatParticipant, defender: CombatParticipant, iterations: number): SimulatedCombatResult[] {
    if (attacker.units.length === 0 && defender.units.length === 0) return [];

    const results: SimulatedCombatResult[] = [];
    for (let index = 0; index < iterations; index++) {
        console.debug(`===== STARTING SIMLUATION #${index + 1} =====`);
        const result = simulateCombatInstance(cloneDeep(attacker), cloneDeep(defender));
        results.push(result);
        console.debug(`===== FINISHED SIMULATION #${index + 1}. VICTOR: ${result.victor} =====`);
    }
    return results;
}

export function simulateCombatInstance(attacker: CombatParticipant, defender: CombatParticipant): SimulatedCombatResult {
    const combat: SimulatedCombat = {
        attacker,
        defender,
        rounds: 1,
    };

    let victor: CombatVictor | undefined = undefined;

    while (combat.rounds < COMBAT_ROUND_LIMIT) {
        victor = determineVictor(combat);
        if (victor) break;
        runCombatRound(combat);
        combat.rounds++;
    }
    return {
        ...combat,
        victor: victor ?? "timeout",
    };
}

function determineVictor(combat: SimulatedCombat): CombatVictor | undefined {
    if (!hasLivingUnits(combat.attacker)) {
        if (!hasLivingUnits(combat.defender)) {
            return "draw";
        }
        return ParticipantRole.Defender;
    }
    if (!hasLivingUnits(combat.defender)) {
        return ParticipantRole.Attacker;
    }
    return undefined;
}

function runCombatRound(combat: SimulatedCombat) {
    console.debug(`--> ROUND ${combat.rounds}`);
    const attackerHits: RolledHit[] = participantCombatRolls(combat.attacker);
    const defenderHits: RolledHit[] = participantCombatRolls(combat.defender);
    console.debug(`Assigning attacker hits: ${attackerHits.length}`);
    assignHits(combat.defender, attackerHits);
    console.debug(`Assigning defender hits: ${defenderHits.length}`);
    assignHits(combat.attacker, defenderHits);
}

function participantCombatRolls(participant: CombatParticipant): RolledHit[] {
    const hits: RolledHit[] = [];
    for (let i = 0; i < participant.units.length; i++) {
        const unit: CombatUnit = participant.units[i];
        const unitHits: RolledHit[] = unitCombatRolls(unit);
        hits.push(...unitHits);
    }
    return hits;
}

function unitCombatRolls(unit: CombatUnit): RolledHit[] {
    const numberOfRolls: number = max([(unit.combatRolls ?? 1) - (unit.sustainedHits ?? 0), 1]) ?? 1;
    const hits: RolledHit[] = [];
    for (let i = 0; i < numberOfRolls; i++) {
        if (combatRoll(unit.combatValue)) {
            unit.scoredHits.push(HitType.Standard);
            hits.push({
                source: unit.type,
                type: HitType.Standard,
            });
        }
    }
    return hits;
}

function combatRoll(combatValue: number): boolean {
    return random(1, 10) >= combatValue;
}

function assignHits(participant: CombatParticipant, hits: RolledHit[]) {
    for (let i = 0; i < hits.length; i++) {
        assignHit(participant, hits[i]);
    }
}

function assignHit(participant: CombatParticipant, hit: RolledHit) {
    const sortedUnits: CombatUnit[] = participant.units.filter((u: CombatUnit) => u.alive).sort(compareHitPriorityOrder);
    // account for "can't assign fighter hits" etc.? Loop list until we find a unit that it can be assigned to?
    const selectedUnit: CombatUnit | undefined = sortedUnits[0];
    if (selectedUnit) {
        if (!canSustainWithoutDying(selectedUnit)) {
            selectedUnit.alive = false;
            console.debug(`${selectedUnit.type} destroyed`);
        } else {
            console.debug(`${selectedUnit.type} sustained a hit`);
        }
        selectedUnit.sustainedHits = (selectedUnit.sustainedHits ?? 0) + 1;
    }
}

function compareHitPriorityOrder(a: CombatUnit, b: CombatUnit): number {
    if (canSustainWithoutDying(a)) {
        if (canSustainWithoutDying(b)) {
            return b.combatValue - a.combatValue;
        }
        return -1;
    }
    if (canSustainWithoutDying(b)) {
        return 1;
    }
    return b.combatValue - a.combatValue;
}

function canSustainWithoutDying(unit: CombatUnit): boolean {
    return !!unit.sustainDamage && (unit.sustainedHits === undefined || unit.sustainedHits < unit.sustainDamage);
}

function hasLivingUnits(participant: CombatParticipant): boolean {
    return participant.units.some((u: CombatUnit) => u.alive);
}

export function aggregateCombatResults(results: SimulatedCombatResult[]): AggregatedCombatResult[] {
    if (results.length === 0) return [];

    const victors: CombatVictor[] = [ParticipantRole.Attacker, "draw", "timeout", ParticipantRole.Defender];
    const groupedResults: Dictionary<SimulatedCombatResult[]> = groupBy(results, (r: SimulatedCombatResult) => r.victor);
    const aggregates: AggregatedCombatResult[] = [];
    for (let victor of victors) {
        const resultsForVictor: SimulatedCombatResult[] = groupedResults[victor] ?? [];
        const probability: number = resultsForVictor.length / results.length;
        aggregates.push({
            victor,
            probability,
        });
    }
    return aggregates;
}

export const unitDefinitions: KeyedDictionary<UnitType, UnitDefinition> = {
    [UnitType.WarSun]: {
        type: UnitType.WarSun,
        combatValue: 3,
        combatRolls: 3,
        sustainDamage: 2,
    },
    [UnitType.Dreadnought]: {
        type: UnitType.Dreadnought,
        combatValue: 5,
        combatRolls: 2,
        sustainDamage: 1,
    },
    [UnitType.Cruiser]: {
        type: UnitType.Cruiser,
        combatValue: 7,
    },
    [UnitType.Destroyer]: {
        type: UnitType.Destroyer,
        combatValue: 9,
        antiFigherBarrage: 2,
    },
    [UnitType.Carrier]: {
        type: UnitType.Carrier,
        combatValue: 9,
    },
    [UnitType.Fighter]: {
        type: UnitType.Fighter,
        combatValue: 9,
    },
};

const COMBAT_ROUND_LIMIT: number = 20;
