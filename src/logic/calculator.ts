import { clamp, max, round } from "lodash";

import {
    CalculationInput,
    CalculationOutput,
    CombatStage,
    CombatStateProbabilityOutput,
    CombatVictor,
    HitsProbabilityOutcome,
    HitType,
    ParticipantInput,
    ParticipantRole,
    UnitInput,
} from "model/calculation";
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
import { ParticipantTag } from "model/combatTags";
import { KeyedDictionary, SparseDictionary } from "model/common";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitDefinition, unitDefinitions, UnitType } from "model/unit";
import { participantTagResources } from "./participant";

export function calculateCombatOutcome(input: CalculationInput): CalculationOutput | null {
    if (input.attacker.units.length === 0 && input.defender.units.length === 0) return null;
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
    return new CombatState(CombatStage.SpaceMines, getInitialParticipantState(input.attacker), getInitialParticipantState(input.defender));
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
    let nextStates: CombatStateProbability[] = resolveCombatStage(currentState.state, input);

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

function resolveCombatStage(state: CombatState, input: CalculationInput): CombatStateProbability[] {
    const nextStates: CombatStateProbability[] = [];

    const attackerUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state.attacker, input, ParticipantRole.Attacker, state.stage);
    const defenderUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state.defender, input, ParticipantRole.Defender, state.stage);

    const attackerHitOutcomes: HitsProbabilityOutcome[] = calculateHits(attackerUnits);
    const defenderHitOutcomes: HitsProbabilityOutcome[] = calculateHits(defenderUnits);

    for (let att = 0; att < attackerHitOutcomes.length; att++) {
        for (let def = 0; def < defenderHitOutcomes.length; def++) {
            const attackerHits: HitsProbabilityOutcome = attackerHitOutcomes[att];
            const defenderHits: HitsProbabilityOutcome = defenderHitOutcomes[def];
            const probability: number = attackerHits.probability * defenderHits.probability;

            const nextAttacker: ParticipantState = assignHits(state.attacker, attackerUnits, defenderHits);
            const nextDefender: ParticipantState = assignHits(state.defender, defenderUnits, attackerHits);
            const nextState: CombatState = new CombatState(getNextStage(state.stage), nextAttacker, nextDefender);
            const identicalState: CombatStateProbability | undefined = findIdenticalCombatState(nextStates, nextState);
            if (identicalState) {
                identicalState.probability += probability;
            } else {
                nextStates.push({
                    probability,
                    state: nextState,
                });
            }
        }
    }
    return nextStates;
}

function findIdenticalCombatState(stateProbabilities: CombatStateProbability[], state: CombatState): CombatStateProbability | undefined {
    for (let stateProbability of stateProbabilities) {
        if (CombatState.compare(stateProbability.state, state) === 0) {
            return stateProbability;
        }
    }
    return undefined;
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
        const baseRolls: number = getCombatRollsForStage(def, stage);
        const rolls: number = max([baseRolls - unit.sustainedHits, baseRolls])!;
        unitSnapshots.push({
            base: unit,
            type: unit.type,
            combatValue: def.combatValue,
            rolls: rolls,
            hitType: getHitTypeForStage(def, stage),
            sustainDamage: def.sustainDamage,
            sustainedHits: unit.sustainedHits,
            tagEffects: [],
        });
    }
    applyUnitSnapshotParticipantTags(participant, input, role, stage, unitSnapshots);
    return unitSnapshots;
}

function applyUnitSnapshotParticipantTags(
    participant: ParticipantState,
    input: CalculationInput,
    role: ParticipantRole,
    stage: CombatStage,
    unitSnapshots: ComputedUnitSnapshot[]
) {
    const participantInput: ParticipantInput = input[role];
    const tagValues: ParticipantTagValueAndState[] = getParticipantTagValues(participantInput, participant);
    const effectInput: ParticipantOnComputeSnapshotInput = {
        units: unitSnapshots,
    };
    for (let { tag } of tagValues) {
        const impl: ParticipantTagImplementation | false = participantTagResources[tag].implementation;
        if (!!impl && !!impl.onComputeUnitSnapshots) {
            impl.onComputeUnitSnapshots(effectInput);
        }
    }
}

interface ParticipantTagValueAndState {
    tag: ParticipantTag;
    value: any;
    state: number | undefined;
}
function getParticipantTagValues(input: ParticipantInput, state: ParticipantState): ParticipantTagValueAndState[] {
    const values: ParticipantTagValueAndState[] = [];
    for (let tagStr of Object.keys(input.tags)) {
        const tag: ParticipantTag = Number(tagStr);
        const tagInputValue: any = input.tags[tag];
        const tagState = state.tags[tag];
        values.push({ tag, value: tagInputValue, state: tagState });
    }
    return values;
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

function getHitTypeForStage(def: UnitDefinition, stage: CombatStage): HitType {
    switch (stage) {
        case CombatStage.AntiFighterBarrage:
            return HitType.AssignToFighter;
    }
    return HitType.Normal;
}

function calculateHits(units: ComputedUnitSnapshot[]): HitsProbabilityOutcome[] {
    const hits: SparseDictionary<HitType, number[]> = {};
    // let hitChances: number[] = [1.0]; // Initial probability: 100% chance for 0 hits.
    for (let unit of units) {
        const hitProbability: number = clamp((11 - unit.combatValue) / 10, 0.0, 1.0);
        const rolls: number = unit.rolls;
        for (let i = 0; i < rolls; i++) {
            // Initial probability: 100% chance for 0 hits.
            hits[unit.hitType] = addHitChance(hits[unit.hitType] ?? [1.0], hitProbability);
        }
    }

    let outcomes: HitsProbabilityOutcome[] = [{ hits: {}, probability: 1.0 }];
    for (let hitTypeStr of Object.keys(hits)) {
        const hitType: HitType = Number(hitTypeStr);
        const probabilities: number[] = hits[hitType]!;
        outcomes = outcomes
            .map((prev: HitsProbabilityOutcome) =>
                probabilities.map(
                    (p: number, idx): HitsProbabilityOutcome => ({
                        hits: {
                            ...prev.hits,
                            [hitType]: idx,
                        },
                        probability: prev.probability * p,
                    })
                )
            )
            .flatMap((arr) => arr);
    }

    return outcomes;
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

function assignHits(participant: ParticipantState, units: ComputedUnitSnapshot[], hitOutcomes: HitsProbabilityOutcome): ParticipantState {
    const newUnits: ComputedUnitSnapshot[] = [...units];
    for (let hitTypeStr of Object.keys(hitOutcomes.hits)) {
        const hitType: HitType = Number(hitTypeStr);
        const numberOfHits: number = hitOutcomes.hits[hitType]!;
        for (let i = 0; i < numberOfHits; i++) {
            assignHit(newUnits, hitType);
        }
    }
    return new ParticipantState(
        newUnits.map((u) => u.base),
        participant.tags
    );
}

function assignHit(units: ComputedUnitSnapshot[], hitType: HitType) {
    const hitIndex: number = determineHitTarget(units, hitType);
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
function determineHitTarget(units: ComputedUnitSnapshot[], hitType: HitType): number {
    let maxPrioIndex: number = -1;
    let maxPrioValue: number = -1;
    for (let i = 0; i < units.length; i++) {
        if (!canAssignHitToUnit(units[i], hitType)) continue;
        const prio = calculateHitPriority(units[i]);
        if (prio > maxPrioValue) {
            maxPrioIndex = i;
            maxPrioValue = prio;
        }
    }
    return maxPrioIndex;
}

function canAssignHitToUnit(unit: ComputedUnitSnapshot, hitType: HitType): boolean {
    switch (hitType) {
        case HitType.AssignToFighter:
            return unit.type === UnitType.Fighter;
        case HitType.Normal:
            return true;
    }
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
            const equalState: CombatStateProbability | undefined = list.find(
                (sp: CombatStateProbability) => CombatState.compare(stateProbability.state, sp.state) === 0
            );
            if (equalState) {
                equalState.probability += stateProbability.probability;
            } else {
                list.push(stateProbability);
            }
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
