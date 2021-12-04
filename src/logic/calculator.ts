import { clamp, round } from "lodash";

import { CombatState, CombatStateOutput, ParticipantState, UnitState } from "model/combatState";
import {
    CalculationInput,
    CalculationOutput,
    CombatStage,
    CombatStateDictionary,
    CombatStateProbability,
    CombatStateProbabilityOutput,
    CombatStateResolution,
    CombatStateResolutionDictionary,
    CombatVictor,
    ComputedUnitSnapshot,
    KeyedDictionary,
    ParticipantInput,
    ParticipantRole,
    PerformanceTracker,
    UnitDefinition,
} from "model/common";
import { unitDefinitions } from "./simulator";

const emptyOutput: CalculationOutput = {
    victorProbabilites: {
        attacker: 0,
        defender: 0,
        draw: 0,
        timeout: 0,
    },
    resultStates: [],
};

const defaultPerformanceObj: PerformanceTracker = {
    calculateCombatOutcome: 0,
    getInitialState: 0,
    resolveState: 0,
    resolveCombatRound: 0,
    appendCombatStateProbability: 0,
    popNextActiveState: 0,
    addMemoizedResolutions: 0,
    assignHit: 0,
    getUnitSnapshot: 0,
    sortUnitsByPriorityOrder: 0,
    resolveHit: 0,
    calculateHits: 0,
    mergeIdenticalStates: 0,
    combatStateComparer: 0,
    hashCombatState: 0,
    participantStateComparer: 0,
    hashParticipantState: 0,
    unitStateComparer: 0,
    hashUnitState: 0,
    getMemoizedResolutions: 0,
    computeNextStates: 0,
    hashCollissions: 0,
    memoizedResolutions: 0,
    calculatedResolutions: 0,
};

let performanceObj = defaultPerformanceObj;

export function calculateCombatOutcome(input: CalculationInput): CalculationOutput {
    if (input.attacker.units.length === 0 && input.defender.units.length === 0) return emptyOutput;
    performanceObj = defaultPerformanceObj;
    const p0 = performance.now();
    let activeState: CombatStateProbability | undefined = {
        state: getInitialState(input),
        probability: 1.0,
    };
    performanceObj.getInitialState += performance.now() - p0;
    const stateDictionary: CombatStateDictionary = {};
    const stateResolutions: CombatStateResolutionDictionary = {};
    while (activeState !== undefined) {
        const nextStates: CombatStateProbability[] = resolveState(activeState, input, stateResolutions);
        appendCombatStateProbabilities(stateDictionary, nextStates);
        activeState = popNextActiveState(stateDictionary);
    }
    performanceObj.calculateCombatOutcome += performance.now() - p0;
    console.log("PERFORMANCE:", JSON.stringify(performanceObj));
    return createCalculationOutput(stateDictionary);
}

function getInitialState(input: CalculationInput): CombatState {
    return new CombatState(
        {
            stage: CombatStage.RoundN,
            attacker: getInitialParticipantState(input.attacker),
            defender: getInitialParticipantState(input.defender),
        },
        performanceObj
    );
}

function getInitialParticipantState(participant: ParticipantInput): ParticipantState {
    // todo: add role as input here; might affect some tags?
    return new ParticipantState(
        {
            units: participant.units.map((up) => new UnitState(up, performanceObj)),
            tags: {}, // todo: convert to inital tag values (only need to track tags with a state that can change during combat)
        },
        performanceObj
    );
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
    const resultStatesOutput: CombatStateProbabilityOutput[] = resultStates.map((resultProbability) => ({
        probability: resultProbability.probability,
        state: resultProbability.state.toOutput(),
    }));
    const victorProbabilites: KeyedDictionary<CombatVictor, number> = {
        attacker: 0,
        defender: 0,
        draw: 0,
        timeout: 0,
    };
    // console.log(JSON.stringify(resultStatesOutput));
    for (let resultState of resultStatesOutput) {
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

function resolveState(
    currentState: CombatStateProbability,
    input: CalculationInput,
    stateResolutions: CombatStateResolutionDictionary
): CombatStateProbability[] {
    const p0 = performance.now();
    let nextStates: CombatStateProbability[];
    const memoizedResolutions: CombatStateProbability[] | undefined = getMemoizedResolutions(currentState.state, stateResolutions);
    if (memoizedResolutions) {
        nextStates = memoizedResolutions;
        performanceObj.memoizedResolutions++;
    } else {
        nextStates = computeNextStates(currentState, input);
        addMemoizedResolutions(currentState.state, nextStates, stateResolutions);
    }
    nextStates = nextStates.map((sp: CombatStateProbability) => ({
        state: sp.state,
        probability: sp.probability * currentState.probability,
    }));
    performanceObj.calculatedResolutions++;
    performanceObj.resolveState += performance.now() - p0;
    return nextStates;
}

function computeNextStates(currentState: CombatStateProbability, input: CalculationInput): CombatStateProbability[] {
    const p0 = performance.now();
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
    // mergeIdenticalStates(nextStates);
    const identicalStateIdx: number = nextStates.findIndex((sp) => CombatState.compare(sp.state, currentState.state) === 0);
    if (identicalStateIdx !== -1) {
        // Remove path that lead to the current state (neither side scores a hit in round N)
        const [identicalState] = nextStates.splice(identicalStateIdx, 1);
        // Inflate probability of remaining states to compensate for the removed path
        const totalProbability = 1 / (1 - identicalState.probability);
        nextStates = nextStates.map((sp: CombatStateProbability) => ({
            state: sp.state,
            probability: sp.probability * totalProbability,
        }));
    }
    performanceObj.computeNextStates += performance.now() - p0;
    return nextStates;
}

// function mergeIdenticalStates(stateProbabilities: CombatStateProbability[]) {
//     const p0 = performance.now();
//     let mergeFound = true;
//     while (mergeFound) {
//         mergeFound = false;
//         for (let i = 0; i < stateProbabilities.length; i++) {
//             const first = stateProbabilities[i];
//             for (let j = i + 1; j < stateProbabilities.length; j++) {
//                 const second = stateProbabilities[j];
//                 if (CombatState.compare(first.state, second.state) === 0) {
//                     first.probability += second.probability;
//                     stateProbabilities.splice(j, 1);
//                     i = stateProbabilities.length;
//                     j = stateProbabilities.length;
//                     mergeFound = true;
//                 }
//             }
//         }
//     }
//     performanceObj.mergeIdenticalStates += performance.now() - p0;
// }

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

function resolveStageNyi(state: CombatState): CombatStateProbability[] {
    return [
        {
            probability: 1.0,
            state: new CombatState(
                {
                    stage: getNextStage(state.stage),
                    attacker: state.attacker,
                    defender: state.defender,
                },
                performanceObj
            ),
        },
    ];
}

function resolveCombatRound(state: CombatState, input: CalculationInput, round: 1 | 2 | "n"): CombatStateProbability[] {
    const p0 = performance.now();
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
                state: new CombatState(
                    {
                        stage: getNextStage(state.stage),
                        attacker: nextAttacker,
                        defender: nextDefender,
                    },
                    performanceObj
                ),
            });
        }
    }
    performanceObj.resolveCombatRound += performance.now() - p0;
    return nextStates;
}

function calculateHits(participant: ParticipantState, input: CalculationInput): number[] {
    const p0 = performance.now();
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
    performanceObj.calculateHits += performance.now() - p0;
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
        nextState = assignHit(nextState);
    }
    return nextState;
}

function assignHit(participant: ParticipantState): ParticipantState {
    const p0 = performance.now();
    let nextState: ParticipantState = participant;
    const units: ComputedUnitSnapshot[] = participant.units.map(getUnitSnapshot);
    const p1 = performance.now();
    performanceObj.getUnitSnapshot += p1 - p0;
    const sortedUnits: ComputedUnitSnapshot[] = units.sort(compareHitPriorityOrder);
    const p2 = performance.now();
    performanceObj.sortUnitsByPriorityOrder += p2 - p1;
    // account for "can't assign fighter hits" etc.? Loop list until we find a unit that it can be assigned to?
    const selectedUnit: ComputedUnitSnapshot | undefined = sortedUnits[0];
    if (selectedUnit) {
        const idx: number = participant.units.findIndex((u) => UnitState.compare(u, selectedUnit.base) === 0);
        let nextUnits: UnitState[];
        if (!canSustainWithoutDying(selectedUnit)) {
            nextUnits = participant.units.filter((u, i) => i !== idx);
        } else {
            nextUnits = participant.units.map((u, i) => (i === idx ? u.sustainHit() : u));
        }
        nextState = new ParticipantState(
            {
                units: nextUnits,
                tags: participant.tags,
            },
            performanceObj
        );
    }
    performanceObj.resolveHit += performance.now() - p2;
    performanceObj.assignHit += performance.now() - p0;
    return nextState;
}

function getUnitSnapshot(unit: UnitState): ComputedUnitSnapshot {
    // todo: add calc input and current stage here
    return {
        // ...unit,
        ...unitDefinitions[unit.type],
        sustainedHits: unit.sustainedHits,
        base: unit,
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
    const p0 = performance.now();
    let next: CombatStateProbability | undefined = undefined;
    for (let key of Object.keys(dict)) {
        const idx: number = dict[key].findIndex((sp: CombatStateProbability) => !combatStateIsFinished(sp.state));
        if (idx !== -1) {
            const stateProbability: CombatStateProbability = dict[key][idx];
            if (dict[key].length === 1) {
                delete dict[key];
            } else {
                dict[key].splice(idx, 1);
            }
            next = stateProbability;
            break;
        }
    }
    performanceObj.popNextActiveState += performance.now() - p0;
    return next;
}

function combatStateIsFinished(state: CombatState): boolean {
    return determineVictor(state) !== undefined;
}

function determineVictor(state: CombatStateOutput): CombatVictor | undefined {
    if (state.defender.units.length === 0) {
        if (state.attacker.units.length === 0) {
            return "draw";
        }
        return ParticipantRole.Attacker;
    }
    if (state.attacker.units.length === 0) {
        return ParticipantRole.Defender;
    }
    // if (state.attacker.units.length === 0) {
    //     if (state.defender.units.length === 0) {
    //         return "draw";
    //     }
    //     return ParticipantRole.Defender;
    // }
    // if (state.defender.units.length === 0) {
    //     return ParticipantRole.Attacker;
    // }
    return undefined;
}

function appendCombatStateProbabilities(dict: CombatStateDictionary, stateProbabilities: CombatStateProbability[]) {
    const p0 = performance.now();
    for (let stateProbability of stateProbabilities) {
        appendCombatStateProbability(dict, stateProbability);
    }
    performanceObj.appendCombatStateProbability += performance.now() - p0;
    // logStatistics(dict);
}

function appendCombatStateProbability(dict: CombatStateDictionary, stateProbability: CombatStateProbability) {
    const hash: number = stateProbability.state.hash;
    const list: CombatStateProbability[] | undefined = dict[hash];
    if (list) {
        if (list.length === 0) {
            console.warn(`appendCombatStateProbability: Empty list found at hash ${hash}`);
            list.push(stateProbability);
        } else {
            // console.log(`Multiple (${list.length}) states found for hash ${hash}. Using equality comparer.`);
            const equalState: CombatStateProbability | undefined = list.find(
                (sp: CombatStateProbability) => CombatState.compare(stateProbability.state, sp.state) === 0
            );
            if (equalState) {
                // console.log(`Equal state found.`);
                equalState.probability += stateProbability.probability;
            } else {
                // console.log(`Equal state not found.`);
                list.push(stateProbability);
                performanceObj.hashCollissions++;
            }
            // const equalStateIdx: number = list.findIndex(
            //     (sp: CombatStateProbability) => CombatState.compare(stateProbability.state, sp.state) === 0
            // );
            // if (equalStateIdx !== -1) {
            //     console.log(`Equal state found.`);
            //     list[equalStateIdx] = {
            //         state: list[equalStateIdx].state,
            //         probability: list[equalStateIdx].probability + stateProbability.probability,
            //     };
            // } else {
            //     console.log(`Equal state not found.`);
            //     list.push(stateProbability);
            //     performanceObj.hashCollissions++;
            // }
        }
    } else {
        dict[hash] = [stateProbability];
    }
}

function getMemoizedResolutions(state: CombatState, dict: CombatStateResolutionDictionary): CombatStateProbability[] | undefined {
    const p0 = performance.now();
    const hash: number = state.hash;
    const list: CombatStateResolution[] | undefined = dict[hash];
    let nextStates: CombatStateProbability[] | undefined = undefined;

    if (list) {
        for (let resolution of list) {
            if (CombatState.compare(resolution.input, state) === 0) {
                nextStates = resolution.nextStates;
                break;
            }
        }
    }
    performanceObj.getMemoizedResolutions += performance.now() - p0;
    return nextStates;
}

function addMemoizedResolutions(state: CombatState, nextStates: CombatStateProbability[], dict: CombatStateResolutionDictionary) {
    const p0 = performance.now();
    const hash: number = state.hash;
    const list: CombatStateResolution[] | undefined = dict[hash];
    const resolution: CombatStateResolution = {
        input: state,
        nextStates: nextStates,
    };
    if (list) {
        list.push(resolution);
    } else {
        dict[hash] = [resolution];
    }
    performanceObj.addMemoizedResolutions += performance.now() - p0;
}

// Next steps: reduce footprint of comparer/hash functions:
// * Sort combatState.units when creating the state, assume that it is sorted in comparer/hash functions
// * Replace string with number for unit type, stage
// * Oh, and remove the (() => {})() wrappers. Check performance impact.
// * Move performance tracker to a parameter?

function logStatistics(dict: CombatStateDictionary) {
    const states: CombatStateProbability[] = Object.values(dict).flat();
    const finished: CombatStateProbability[] = states.filter((sp: CombatStateProbability) => combatStateIsFinished(sp.state));
    console.log(`State count: ${states.length} (finished: ${finished.length})`);
}
