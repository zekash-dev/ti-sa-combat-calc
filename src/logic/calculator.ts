import { clamp, round } from "lodash";

import {
    CombatState,
    CombatStateDictionary,
    CombatStateProbability,
    CombatStateResolution,
    CombatStateResolutionDictionary,
    ComputedUnitSnapshot,
    ParticipantState,
    UnitState,
} from "model/combatState";
import { KeyedDictionary } from "model/common";
import {
    CalculationInput,
    CalculationOutput,
    CombatStage,
    CombatStateProbabilityOutput,
    CombatVictor,
    ParticipantInput,
    ParticipantRole,
    UnitInput,
} from "model/calculation";
import { UnitDefinition, unitDefinitions } from "model/unit";

const emptyOutput: CalculationOutput = {
    victorProbabilites: {
        attacker: 0,
        defender: 0,
        draw: 0,
    },
    resultStates: [],
};

export function calculateCombatOutcome(input: CalculationInput): CalculationOutput {
    if (input.attacker.units.length === 0 && input.defender.units.length === 0) return emptyOutput;
    if (process.env.NODE_ENV === "development") {
        console.profile();
    }
    let activeState: CombatStateProbability | undefined = {
        state: getInitialState(input),
        probability: 1.0,
    };
    const stateDictionary: CombatStateDictionary = {};
    const stateResolutions: CombatStateResolutionDictionary = {};
    while (activeState !== undefined) {
        const nextStates: CombatStateProbability[] = resolveState(activeState, input, stateResolutions);
        appendCombatStateProbabilities(stateDictionary, nextStates);
        activeState = popNextActiveState(stateDictionary);
    }
    const output = createCalculationOutput(stateDictionary, input);
    if (process.env.NODE_ENV === "development") {
        console.profileEnd();
    }
    return output;
}

function getInitialState(input: CalculationInput): CombatState {
    return new CombatState(CombatStage.RoundN, getInitialParticipantState(input.attacker), getInitialParticipantState(input.defender));
}

function getInitialParticipantState(participant: ParticipantInput): ParticipantState {
    // todo: add role as input here; might affect some tags?
    // todo: convert to inital tag values (only need to track tags with a state that can change during combat)
    return new ParticipantState(
        participant.units.map((up) => new UnitState(up.type, up.sustainedHits, up.tags)),
        {}
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

function createCalculationOutput(stateDictionary: CombatStateDictionary, input: CalculationInput): CalculationOutput {
    const resultStates: CombatStateProbability[] = Object.values(stateDictionary).flat();
    const resultStatesOutput: CombatStateProbabilityOutput[] = resultStates.map((resultProbability) => ({
        probability: resultProbability.probability,
        state: resultProbability.state.toOutput(input),
    }));
    const victorProbabilites: KeyedDictionary<CombatVictor, number> = {
        attacker: 0,
        defender: 0,
        draw: 0,
    };
    // console.log(JSON.stringify(resultStatesOutput));
    for (let resultState of resultStatesOutput) {
        const victor: CombatVictor | undefined = determineVictor(resultState.state);
        if (victor) {
            victorProbabilites[victor] += resultState.probability;
        }
    }
    return {
        resultStates: resultStatesOutput,
        victorProbabilites,
    };
}

function resolveState(
    currentState: CombatStateProbability,
    input: CalculationInput,
    stateResolutions: CombatStateResolutionDictionary
): CombatStateProbability[] {
    let nextStates: CombatStateProbability[];
    const memoizedResolutions: CombatStateProbability[] | undefined = getMemoizedResolutions(currentState.state, stateResolutions);
    if (memoizedResolutions) {
        nextStates = memoizedResolutions;
    } else {
        nextStates = computeNextStates(currentState, input);
        addMemoizedResolutions(currentState.state, nextStates, stateResolutions);
    }
    nextStates = nextStates.map((sp: CombatStateProbability) => ({
        state: sp.state,
        probability: sp.probability * currentState.probability,
    }));
    return nextStates;
}

function computeNextStates(currentState: CombatStateProbability, input: CalculationInput): CombatStateProbability[] {
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
            nextStates = resolveCombatRound(currentState.state, input, CombatStage.Round1);
            break;
        case CombatStage.Round2:
            nextStates = resolveCombatRound(currentState.state, input, CombatStage.Round1);
            break;
        case CombatStage.RoundN:
            nextStates = resolveCombatRound(currentState.state, input, CombatStage.RoundN);
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
    return nextStates;
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

function resolveStageNyi(state: CombatState): CombatStateProbability[] {
    return [
        {
            probability: 1.0,
            state: new CombatState(getNextStage(state.stage), state.attacker, state.defender),
        },
    ];
}

function resolveCombatRound(state: CombatState, input: CalculationInput, stage: CombatStage): CombatStateProbability[] {
    const nextStates: CombatStateProbability[] = [];

    const attackerUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state.attacker, input, ParticipantRole.Attacker, stage);
    const defenderUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state.defender, input, ParticipantRole.Defender, stage);

    const attackerHits: number[] = calculateHits(attackerUnits);
    const defenderHits: number[] = calculateHits(defenderUnits);

    for (let att = 0; att < attackerHits.length; att++) {
        for (let def = 0; def < defenderHits.length; def++) {
            const probability: number = attackerHits[att] * defenderHits[def];

            const nextAttacker: ParticipantState = assignHits(state.attacker, attackerUnits, def);
            const nextDefender: ParticipantState = assignHits(state.defender, defenderUnits, att);
            nextStates.push({
                probability,
                state: new CombatState(getNextStage(state.stage), nextAttacker, nextDefender),
            });
        }
    }
    return nextStates;
}

function getUnitSnapshots(
    participant: ParticipantState,
    input: CalculationInput,
    role: ParticipantRole,
    stage: CombatStage
): ComputedUnitSnapshot[] {
    const unitSnapshots: ComputedUnitSnapshot[] = [];
    for (let unit of participant.units) {
        const def: UnitDefinition = unitDefinitions[unit.type];
        unitSnapshots.push({
            base: unit,
            type: unit.type,
            combatValue: def.combatValue,
            rolls: getCombatRollsForStage(def, stage),
            sustainDamage: def.sustainDamage,
            sustainedHits: unit.sustainedHits,
        });
    }
    return unitSnapshots;
}

function getCombatRollsForStage(def: UnitDefinition, stage: CombatStage): number {
    switch (stage) {
        case CombatStage.SpaceMines:
            return 0;
        case CombatStage.PDS:
            return 0;
        case CombatStage.StartOfBattle:
            return 0;
        case CombatStage.AntiFighterBarrage:
            return def.antiFigherBarrage;
        case CombatStage.PreCombat:
            return def.preCombatShots;
        case CombatStage.Round1:
        case CombatStage.Round2:
        case CombatStage.RoundN:
            return def.combatRolls;
    }
}

function calculateHits(units: ComputedUnitSnapshot[]): number[] {
    let hitChances: number[] = [1.0]; // Initial probability: 100% chance for 0 hits.
    for (let unit of units) {
        const hitProbability: number = clamp((11 - unit.combatValue) / 10, 0.0, 1.0);
        const rolls: number = unit.rolls;
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

function assignHits(participant: ParticipantState, units: ComputedUnitSnapshot[], hits: number): ParticipantState {
    const newUnits: ComputedUnitSnapshot[] = [...units];
    for (let i = 0; i < hits; i++) {
        assignHit(newUnits);
    }
    return new ParticipantState(
        newUnits.map((u) => u.base),
        participant.tags
    );
}

function assignHit(units: ComputedUnitSnapshot[]) {
    const hitIndex: number = determineHitTarget(units);
    if (hitIndex !== -1) {
        // account for "can't assign fighter hits" etc.? Loop list until we find a unit that it can be assigned to?
        const selectedUnit: ComputedUnitSnapshot | undefined = units[hitIndex];
        if (selectedUnit) {
            if (!canSustainWithoutDying(selectedUnit)) {
                units.splice(hitIndex, 1);
            } else {
                const sustainedHits: number = selectedUnit.sustainedHits + 1;
                const newUnit: ComputedUnitSnapshot = {
                    ...selectedUnit,
                    sustainedHits,
                    base: new UnitState(selectedUnit.type, sustainedHits, selectedUnit.base.tags),
                };
                units[hitIndex] = newUnit;
            }
        }
    }

    return units;
}

/**
 * Returns the index of the unit that should suffer the hit.
 * @param units
 */
function determineHitTarget(units: ComputedUnitSnapshot[]): number {
    let maxPrioIndex: number = -1;
    let maxPrioValue: number = -1;
    for (let i = 0; i < units.length; i++) {
        const prio = calculateHitPriority(units[i]);
        if (prio > maxPrioValue) {
            maxPrioIndex = i;
            maxPrioValue = prio;
        }
    }
    return maxPrioIndex;
}

function calculateHitPriority(unit: ComputedUnitSnapshot): number {
    let priority: number = unit.combatValue;
    if (canSustainWithoutDying(unit)) {
        priority += 10;
    }
    return priority;
}

function canSustainWithoutDying(unit: ComputedUnitSnapshot): boolean {
    return unit.sustainedHits < unit.sustainDamage;
}

export function calculateAverageHits(hitChances: number[]): number {
    return round(
        hitChances.reduce((prev, curr, i) => prev + curr * i, 0),
        2
    );
}

function popNextActiveState(dict: CombatStateDictionary): CombatStateProbability | undefined {
    let next: CombatStateProbability | undefined = undefined;
    let nextUnitCount: number = 0;
    let nextDictKey: string = "";
    let nextArrayIdx: number = 0;

    for (let key of Object.keys(dict)) {
        for (let i = 0; i < dict[key].length; i++) {
            const stateProbability: CombatStateProbability = dict[key][i];
            if (!combatStateIsFinished(stateProbability.state)) {
                const unitCount: number = stateProbability.state.attacker.units.length + stateProbability.state.defender.units.length;
                if (unitCount > nextUnitCount) {
                    next = stateProbability;
                    nextDictKey = key;
                    nextArrayIdx = i;
                    nextUnitCount = unitCount;
                }
            }
        }
    }
    if (next) {
        if (dict[nextDictKey].length === 1) {
            delete dict[nextDictKey];
        } else {
            dict[nextDictKey].splice(nextArrayIdx, 1);
        }
    }
    return next;
}

function combatStateIsFinished(state: CombatState): boolean {
    return determineVictor(state) !== undefined;
}

type CombatStateLike = { [key in ParticipantRole]: { units: UnitInput[] } };
function determineVictor(state: CombatStateLike): CombatVictor | undefined {
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

function appendCombatStateProbabilities(dict: CombatStateDictionary, stateProbabilities: CombatStateProbability[]) {
    for (let stateProbability of stateProbabilities) {
        appendCombatStateProbability(dict, stateProbability);
    }
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
            // }
        }
    } else {
        dict[hash] = [stateProbability];
    }
}

function getMemoizedResolutions(state: CombatState, dict: CombatStateResolutionDictionary): CombatStateProbability[] | undefined {
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
    return nextStates;
}

function addMemoizedResolutions(state: CombatState, nextStates: CombatStateProbability[], dict: CombatStateResolutionDictionary) {
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
}

// function logStatistics(dict: CombatStateDictionary) {
//     const states: CombatStateProbability[] = Object.values(dict).flat();
//     const finished: CombatStateProbability[] = states.filter((sp: CombatStateProbability) => combatStateIsFinished(sp.state));
//     console.log(`State count: ${states.length} (finished: ${finished.length})`);
// }
