import { clamp, round } from "lodash";
import { unitDefinitions } from "./simulator";
import {
    CalculationInput,
    CalculationOutput,
    CombatStage,
    CombatState,
    CombatStateDictionary,
    CombatStateProbability,
    CombatStateTags,
    CombatVictor,
    ComputedUnitSnapshot,
    KeyedDictionary,
    ParticipantInput,
    ParticipantRole,
    ParticipantState,
    UnitDefinition,
    UnitState,
} from "model/common";

const emptyOutput: CalculationOutput = {
    victorProbabilites: {
        attacker: 0,
        defender: 0,
        draw: 0,
        timeout: 0,
    },
    resultStates: [],
};

export function calculateCombatOutcome(input: CalculationInput): CalculationOutput {
    if (input.attacker.units.length === 0 && input.defender.units.length === 0) return emptyOutput;

    let activeState: CombatStateProbability | undefined = {
        state: getInitialState(input),
        probability: 1.0,
    };
    const stateDictionary: CombatStateDictionary = {};
    while (activeState !== undefined) {
        const nextStates: CombatStateProbability[] = resolveState(activeState, input);
        appendCombatStateProbabilities(stateDictionary, nextStates);
        activeState = popNextActiveState(stateDictionary);
    }
    return createCalculationOutput(stateDictionary);
}

function getInitialState(input: CalculationInput): CombatState {
    return {
        stage: CombatStage.SpaceMines,
        attacker: getInitialParticipantState(input.attacker),
        defender: getInitialParticipantState(input.defender),
    };
}

function getInitialParticipantState(participant: ParticipantInput): ParticipantState {
    // todo: add role as input here; might affect some tags?
    return {
        units: participant.units,
        tags: {}, // todo: convert to inital tag values (only need to track tags with a state that can change during combat)
    };
}

function getNextStage(stage: CombatStage): CombatStage {
    switch (stage) {
        case CombatStage.SpaceMines:
            return CombatStage.PDS;
        case CombatStage.PDS:
            return CombatStage.StartOfBattle;
        case CombatStage.StartOfBattle:
            return CombatStage.AntiFighterBarrage;
        case CombatStage.AntiFighterBarrage:
            return CombatStage.PreCombat;
        case CombatStage.PreCombat:
            return CombatStage.Round1;
        case CombatStage.Round1:
            return CombatStage.Round2;
        case CombatStage.Round2:
        case CombatStage.RoundN:
            return CombatStage.RoundN;
    }
}

function createCalculationOutput(stateDictionary: CombatStateDictionary): CalculationOutput {
    const resultStates: CombatStateProbability[] = Object.values(stateDictionary).flat();
    const victorProbabilites: KeyedDictionary<CombatVictor, number> = {
        attacker: 0,
        defender: 0,
        draw: 0,
        timeout: 0,
    };
    for (let resultState of resultStates) {
        const victor: CombatVictor | undefined = determineVictor(resultState.state);
        if (victor) {
            victorProbabilites[victor] += resultState.probability;
        }
    }
    return {
        resultStates,
        victorProbabilites,
    };
}

function resolveState(currentState: CombatStateProbability, input: CalculationInput): CombatStateProbability[] {
    let nextStates: CombatStateProbability[];
    switch (currentState.state.stage) {
        case CombatStage.SpaceMines:
            nextStates = resolveSpaceMines(currentState.state, input);
            break;
        case CombatStage.PDS:
            nextStates = resolvePds(currentState.state, input);
            break;
        case CombatStage.StartOfBattle:
            nextStates = resolveStartOfBattle(currentState.state, input);
            break;
        case CombatStage.AntiFighterBarrage:
            nextStates = resolveAntiFighterBarrage(currentState.state, input);
            break;
        case CombatStage.PreCombat:
            nextStates = resolvePreCombat(currentState.state, input);
            break;
        case CombatStage.Round1:
            nextStates = resolveCombatRound(currentState.state, input, 1);
            break;
        case CombatStage.Round2:
            nextStates = resolveCombatRound(currentState.state, input, 2);
            break;
        case CombatStage.RoundN:
            nextStates = resolveCombatRound(currentState.state, input, "n");
            break;
    }
    mergeIdenticalStates(nextStates);
    const identicalStateIdx: number = nextStates.findIndex((sp) => combatStateComparer(sp.state, currentState.state) === 0);
    let totalProbability: number = currentState.probability;
    if (identicalStateIdx !== -1) {
        // Remove paths that lead to the current state.
        const [identicalState] = nextStates.splice(identicalStateIdx, 1);
        // Remove this state's probability from the total
        totalProbability /= 1 - identicalState.probability;
    }
    return nextStates.map((sp: CombatStateProbability) => ({
        state: sp.state,
        probability: sp.probability * totalProbability,
    }));
}

function mergeIdenticalStates(stateProbabilities: CombatStateProbability[]) {
    let mergeFound = true;
    while (mergeFound) {
        mergeFound = false;
        for (let i = 0; i < stateProbabilities.length; i++) {
            const first = stateProbabilities[i];
            for (let j = i + 1; j < stateProbabilities.length; j++) {
                const second = stateProbabilities[j];
                if (combatStateComparer(first.state, second.state) === 0) {
                    first.probability += second.probability;
                    stateProbabilities.splice(j, 1);
                    i = stateProbabilities.length;
                    j = stateProbabilities.length;
                    mergeFound = true;
                }
            }
        }
    }
}

function resolveSpaceMines(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    return resolveStageNyi(state);
}

function resolvePds(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    return resolveStageNyi(state);
}

function resolveStartOfBattle(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    return resolveStageNyi(state);
}

function resolveAntiFighterBarrage(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    return resolveStageNyi(state);
}

function resolvePreCombat(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    return resolveStageNyi(state);
}

function resolveStageNyi(state: CombatState) {
    return [
        {
            probability: 1.0,
            state: {
                stage: getNextStage(state.stage),
                attacker: state.attacker,
                defender: state.defender,
            },
        },
    ];
}

function resolveCombatRound(state: CombatState, input: CalculationInput, round: 1 | 2 | "n"): CombatStateProbability[] {
    const nextStates: CombatStateProbability[] = [];

    const attackerHits: number[] = calculateHits(state.attacker, input);
    const defenderHits: number[] = calculateHits(state.defender, input);

    for (let att = 0; att < attackerHits.length; att++) {
        for (let def = 0; def < defenderHits.length; def++) {
            const probability: number = attackerHits[att] * defenderHits[def];

            const nextAttacker: ParticipantState = assignHits(state.attacker, def);
            const nextDefender: ParticipantState = assignHits(state.defender, att);
            nextStates.push({
                probability,
                state: {
                    stage: getNextStage(state.stage),
                    attacker: nextAttacker,
                    defender: nextDefender,
                },
            });
        }
    }
    return nextStates;
}

function calculateHits(participant: ParticipantState, input: CalculationInput): number[] {
    // todo: add role as part of input; tags are dependent on it.
    let hitChances: number[] = [1.0]; // Initial probability: 100% chance for 0 hits.
    for (let unit of participant.units) {
        const unitDef: UnitDefinition = unitDefinitions[unit.type];
        // todo: always miss/hit on nat 1 and 10?
        const hitProbability: number = clamp((11 - unitDef.combatValue) / 10, 0.0, 1.0);
        const rolls: number = unitDef.combatRolls ?? 1;
        for (let i = 0; i < rolls; i++) {
            hitChances = addHitChance(hitChances, hitProbability);
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

function assignHits(participant: ParticipantState, hits: number): ParticipantState {
    let nextState: ParticipantState = participant;
    for (let i = 0; i < hits; i++) {
        nextState = assignHit(participant);
    }
    return nextState;
}

function assignHit(participant: ParticipantState): ParticipantState {
    const units: ComputedUnitSnapshot[] = participant.units.map(getUnitSnapshot);
    const sortedUnits: ComputedUnitSnapshot[] = units.sort(compareHitPriorityOrder);
    // account for "can't assign fighter hits" etc.? Loop list until we find a unit that it can be assigned to?
    const selectedUnit: ComputedUnitSnapshot | undefined = sortedUnits[0];
    if (selectedUnit) {
        const idx: number = participant.units.findIndex((u) => unitStateComparer(u, selectedUnit) === 0);
        let nextUnits: UnitState[];
        if (!canSustainWithoutDying(selectedUnit)) {
            nextUnits = participant.units.filter((u, i) => i !== idx);
        } else {
            nextUnits = participant.units.map((u, i) => (i === idx ? { type: u.type, sustainedHits: (u.sustainedHits ?? 0) + 1 } : u));
        }
        return {
            units: nextUnits,
            tags: participant.tags,
        };
    }
    // Could not assign the hit to anything
    return participant;
}

function getUnitSnapshot(unit: UnitState): ComputedUnitSnapshot {
    // todo: add calc input and current stage here
    return {
        ...unit,
        ...unitDefinitions[unit.type],
    };
}

function compareHitPriorityOrder(a: ComputedUnitSnapshot, b: ComputedUnitSnapshot): number {
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

function canSustainWithoutDying(unit: ComputedUnitSnapshot): boolean {
    return !!unit.sustainDamage && (unit.sustainedHits === undefined || unit.sustainedHits < unit.sustainDamage);
}

export function calculateAverageHits(hitChances: number[]): number {
    return round(
        hitChances.reduce((prev, curr, i) => prev + curr * i, 0),
        2
    );
}

function popNextActiveState(dict: CombatStateDictionary): CombatStateProbability | undefined {
    for (let key of Object.keys(dict)) {
        const idx: number = dict[key].findIndex((sp: CombatStateProbability) => !combatStateIsFinished(sp.state));
        if (idx !== -1) {
            const stateProbability: CombatStateProbability = dict[key][idx];
            if (dict[key].length === 1) {
                delete dict[key];
            } else {
                dict[key] = dict[key].splice(idx, 1);
            }
            return stateProbability;
        }
    }
    return undefined;
}

function combatStateIsFinished(state: CombatState): boolean {
    return determineVictor(state) !== undefined;
}

function determineVictor(state: CombatState): CombatVictor | undefined {
    if (state.attacker.units.length === 0) {
        if (state.defender.units.length === 0) {
            return "draw";
        }
        return ParticipantRole.Defender;
    }
    if (state.defender.units.length === 0) {
        return ParticipantRole.Attacker;
    }
    return undefined;
}

function combatStateComparer(a: CombatState, b: CombatState): number {
    if (a.stage !== b.stage) return a.stage.localeCompare(b.stage);
    for (let role of [ParticipantRole.Attacker, ParticipantRole.Defender]) {
        const unitsA: UnitState[] = a[role].units.sort(unitStateComparer);
        const unitsB: UnitState[] = b[role].units.sort(unitStateComparer);
        if (unitsA.length !== unitsB.length) return unitsA.length - unitsB.length;
        for (let i = 0; i < unitsA.length; i++) {
            const comparison: number = unitStateComparer(unitsA[i], unitsB[i]);
            if (comparison !== 0) return comparison;
        }
    }
    return 0;
}

function unitStateComparer(a: UnitState, b: UnitState): number {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    if (a.sustainedHits !== b.sustainedHits) return (a.sustainedHits ?? 0) - (b.sustainedHits ?? 0);
    return combatStateTagsComparer(a.tags, b.tags);
}

function combatStateTagsComparer(a: CombatStateTags | undefined, b: CombatStateTags | undefined): number {
    if (a || b) {
        if (!a || !b) return Number(!!a) - Number(!!b);
        const aKeys: string[] = Object.keys(a.tags);
        const bKeys: string[] = Object.keys(b.tags);
        if (aKeys.length !== bKeys.length) return aKeys.length - bKeys.length;
        for (let key of aKeys) {
            if (a[key] !== b[key]) return (a[key] ?? 0) - (b[key] ?? 0);
        }
    }
    return 0;
}

function appendCombatStateProbabilities(dict: CombatStateDictionary, stateProbabilities: CombatStateProbability[]) {
    for (let stateProbability of stateProbabilities) {
        appendCombatStateProbability(dict, stateProbability);
    }
    logStatistics(dict);
}

function logStatistics(dict: CombatStateDictionary) {
    const states: CombatStateProbability[] = Object.values(dict).flat();
    const finished: CombatStateProbability[] = states.filter((sp: CombatStateProbability) => combatStateIsFinished(sp.state));
    console.log(`State count: ${states.length} (finished: ${finished.length})`);
}

function appendCombatStateProbability(dict: CombatStateDictionary, stateProbability: CombatStateProbability) {
    const hash: number = hashCombatState(stateProbability.state);
    const list: CombatStateProbability[] | undefined = dict[hash];
    if (list) {
        if (list.length === 0) {
            console.warn(`Empty list found at hash ${hash}`);
            list.push(stateProbability);
        } else if (list.length === 1) {
            list[0].probability += stateProbability.probability;
        } else {
            console.log(`Multiple (${list.length}) states found for hash ${hash}. Using equality comparer.`);
            const equalState: CombatStateProbability | undefined = list.find(
                (sp: CombatStateProbability) => combatStateComparer(stateProbability.state, sp.state) === 0
            );
            if (equalState) {
                console.log(`Equal state found.`);
                equalState.probability += stateProbability.probability;
            } else {
                console.log(`Equal state not found.`);
                list.push(stateProbability);
            }
        }
    } else {
        dict[hash] = [stateProbability];
    }
}

function hashCombatState(state: CombatState): number {
    let hash: number = getStringHashCode(state.stage);
    for (let participant of [state.attacker, state.defender]) {
        for (let unit of participant.units.sort(unitStateComparer)) {
            hash = (hash << 5) - hash + getStringHashCode(unit.type);
            hash = (hash << 5) - hash + (unit.sustainedHits ?? 0);
            hash = (hash << 5) - hash + hashCombatStateTags(unit.tags);
        }
        hash = (hash << 5) - hash + hashCombatStateTags(participant.tags);
    }
    return hash;
}

function hashCombatStateTags(tags: CombatStateTags | undefined): number {
    if (tags === undefined) return 0;
    let hash: number = 0;
    for (let key of Object.keys(tags).sort()) {
        hash = (hash << 5) - hash + getStringHashCode(key);
        hash = (hash << 5) - hash + tags[key];
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function getStringHashCode(str: string): number {
    let hash: number = 0;
    for (var i = 0; i < str.length; i++) {
        const character: number = str.charCodeAt(i);
        hash = (hash << 5) - hash + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
