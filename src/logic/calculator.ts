import { clamp, isEqual, max, round, sum } from "lodash";

import {
    CalculationInput,
    CalculationOutput,
    CalculationOutputStatistics,
    combatRoundStages,
    CombatStage,
    CombatStageOutput,
    CombatStageParticipantStatistics,
    combatStagesByCombatType,
    CombatStateProbabilityOutput,
    CombatType,
    CombatVictor,
    HIT_TYPE_AND_FLAGS_BITMASK,
    HIT_TYPE_BITMASK,
    HitsProbabilityIntermediateOutcome,
    HitsProbabilityOutcome,
    HitType,
    ParticipantInput,
    ParticipantRole,
    SurvivingUnitsStatistics,
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
import { ConstantTag, FlagshipTag, ParticipantTag, UnitTag, UnitTagResources } from "model/combatTags";
import { KeyedDictionary, SparseDictionary } from "model/common";
import {
    OnCalculateHitsInput,
    ParticipantOnComputeSnapshotInput,
    ParticipantTagImplementation,
    PreAssignHitsInput,
    UnitOnComputeSnapshotInput,
} from "model/effects";
import { UnitDefinition, unitDefinitions, UnitType } from "model/unit";
import { equalsZero, leftShiftWithMask, rightShiftWithMask } from "./common";
import { flagshipDefinitions, getOpponentRole, participantTagResources, unitTagResources } from "./participant";

export function calculateCombatOutcome(input: CalculationInput): CalculationOutput | null {
    if (input.attacker.units.length === 0 && input.defender.units.length === 0) return null;
    if (process.env.NODE_ENV === "development") {
        console.profile();
    }
    const initialState: CombatStateProbability | undefined = {
        state: getInitialState(input),
        probability: 1.0,
    };
    const stateDictionary: CombatStateDictionary = {};
    const statesByStage: SparseDictionary<CombatStage, CombatStateProbability[]> = {};
    const stateResolutions: CombatStateResolutionDictionary = {};
    appendCombatStateProbabilities(stateDictionary, [initialState]);
    addStatesByStage(statesByStage, initialState.probability, [initialState]);
    let activeState: CombatStateProbability | undefined;
    while ((activeState = popNextActiveState(stateDictionary, input.combatType)) !== undefined) {
        const nextStates: CombatStateProbability[] = resolveState(activeState, input, stateResolutions);
        appendCombatStateProbabilities(stateDictionary, nextStates);
        addStatesByStage(statesByStage, activeState.probability, nextStates);
    }
    const output = createCalculationOutput(stateDictionary, statesByStage, input);
    if (process.env.NODE_ENV === "development") {
        console.profileEnd();
    }
    return output;
}

export function getInitialState(input: CalculationInput): CombatState {
    const initialStage: CombatStage = input.combatType === CombatType.SpaceBattle ? CombatStage.SpaceMines : CombatStage.Bombardment;
    return new CombatState(initialStage, getInitialParticipantState(input.attacker), getInitialParticipantState(input.defender));
}

function getInitialParticipantState(participant: ParticipantInput): ParticipantState {
    // todo: add role as input here; might affect some tags?
    // todo: convert to inital tag values (only need to track tags with a state that can change during combat)
    return new ParticipantState(
        participant.units.map((up) => new UnitState(up.type, up.sustainedHits, up.tags)),
        {}
    );
}

export function getNextStage(combatType: CombatType, stage: CombatStage): CombatStage {
    const currentIndex = combatStagesByCombatType[combatType].indexOf(stage);
    if (currentIndex === -1) {
        throw new Error(`Unexpected combat stage for CombatType ${combatType}: ${stage}`);
    }
    if (currentIndex === combatStagesByCombatType[combatType].length - 1) {
        return stage;
    }
    return combatStagesByCombatType[combatType][currentIndex + 1];
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

    const attackerUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state, input, ParticipantRole.Attacker, state.stage);
    const defenderUnits: ComputedUnitSnapshot[] = getUnitSnapshots(state, input, ParticipantRole.Defender, state.stage);

    const attackerHitOutcomes: HitsProbabilityOutcome[] = calculateHits(state, input, ParticipantRole.Attacker, attackerUnits);
    const defenderHitOutcomes: HitsProbabilityOutcome[] = calculateHits(state, input, ParticipantRole.Defender, defenderUnits);

    for (let att = 0; att < attackerHitOutcomes.length; att++) {
        for (let def = 0; def < defenderHitOutcomes.length; def++) {
            const attackerHits: HitsProbabilityOutcome = attackerHitOutcomes[att];
            const defenderHits: HitsProbabilityOutcome = defenderHitOutcomes[def];
            const probability: number = attackerHits.probability * defenderHits.probability;

            let nextState: CombatState = state;
            nextState = assignHits(nextState, input, ParticipantRole.Attacker, attackerUnits, defenderHits.hits);
            nextState = assignHits(nextState, input, ParticipantRole.Defender, defenderUnits, attackerHits.hits);
            nextState = nextState.setStage(getNextStage(input.combatType, nextState.stage));
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

export function getUnitSnapshots(
    combatState: CombatState,
    input: CalculationInput,
    role: ParticipantRole,
    stage: CombatStage
): ComputedUnitSnapshot[] {
    const unitSnapshots: ComputedUnitSnapshot[] = [];
    const participant: ParticipantState = combatState[role];
    for (let unit of participant.units) {
        const def: UnitDefinition = unit.type === UnitType.Flagship ? flagshipDefinitions[input[role].faction] : unitDefinitions[unit.type];
        unitSnapshots.push({
            base: unit,
            type: unit.type,
            combatValue: def.combatValue,
            rolls: getCombatRollsForStage(def, stage, role, input.combatType),
            hitType: getHitTypeForStage(def, stage),
            nonStandardRolls: [],
            sustainDamage: def.sustainDamage,
            sustainedHits: unit.sustainedHits,
            planetaryShield: def.planetaryShield,
            tagEffects: [],
        });
    }
    applyUnitSnapshotParticipantTags(combatState, input, role, stage, unitSnapshots);
    applyUnitSnapshotUnitTags(combatState, input, role, stage, unitSnapshots);
    applyOpponentUnitSnapshotParticipantTags(combatState, input, getOpponentRole(role), stage, unitSnapshots);
    for (let unit of unitSnapshots) {
        // Tags can set a unit's rolls to NaN to indicate that it should never get any rolls, regardless of other effects.
        // Here we convert NaN -> 0 to allow the rest of the calculation to work as expected.
        if (isNaN(unit.rolls)) {
            unit.rolls = 0;
        }
    }
    adjustCombatRollsForSustainDamage(stage, unitSnapshots);
    return unitSnapshots;
}

function applyUnitSnapshotParticipantTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    role: ParticipantRole,
    stage: CombatStage,
    unitSnapshots: ComputedUnitSnapshot[]
) {
    const participant: ParticipantState = combatState[role];
    const participantInput: ParticipantInput = calculationInput[role];
    const tagValues: ParticipantTagValueAndState[] = getParticipantTagValues(calculationInput, participantInput, participant);
    const effectInput: ParticipantOnComputeSnapshotInput = {
        calculationInput,
        combatState,
        role,
        stage,
        units: unitSnapshots,
    };
    for (let { implementation } of tagValues) {
        if (!!implementation && !!implementation.onComputeUnitSnapshots) {
            implementation.onComputeUnitSnapshots(effectInput);
        }
    }
}

/**
 * Apply tag effects from your opponent to your own units.
 */
function applyOpponentUnitSnapshotParticipantTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    opponentRole: ParticipantRole,
    stage: CombatStage,
    unitSnapshots: ComputedUnitSnapshot[]
) {
    const opponentState: ParticipantState = combatState[opponentRole];
    const opponentInput: ParticipantInput = calculationInput[opponentRole];
    const opponentTagValues: ParticipantTagValueAndState[] = getParticipantTagValues(calculationInput, opponentInput, opponentState);
    const effectInput: ParticipantOnComputeSnapshotInput = {
        calculationInput,
        combatState,
        role: opponentRole,
        stage,
        units: unitSnapshots,
    };
    for (let { implementation } of opponentTagValues) {
        if (!!implementation && !!implementation.onComputeOpponentUnitSnapshots) {
            implementation.onComputeOpponentUnitSnapshots(effectInput);
        }
    }
}

function applyUnitSnapshotUnitTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    role: ParticipantRole,
    stage: CombatStage,
    unitSnapshots: ComputedUnitSnapshot[]
) {
    for (let unit of unitSnapshots) {
        if (unit.base.tags) {
            const unitInput: UnitOnComputeSnapshotInput = {
                calculationInput,
                combatState,
                role,
                stage,
                unit,
            };
            for (let tagStr of Object.keys(unit.base.tags)) {
                const tag: UnitTag = Number(tagStr);
                const resources: UnitTagResources = unitTagResources[tag];
                if (resources?.implementation && resources.implementation.onComputeUnitSnapshot) {
                    resources.implementation.onComputeUnitSnapshot(unitInput);
                }
            }
        }
    }
}

interface ParticipantTagValueAndState {
    tag: ParticipantTag;
    implementation: ParticipantTagImplementation | false;
    inputValue: any;
    state: number | undefined;
}

function getParticipantTagValues(
    calculationInput: CalculationInput,
    participantInput: ParticipantInput,
    state: ParticipantState
): ParticipantTagValueAndState[] {
    const values: ParticipantTagValueAndState[] = [];

    for (let tagStr of Object.keys(calculationInput.tags)) {
        const tag: ParticipantTag = Number(tagStr);
        const tagInputValue: any = calculationInput.tags[tag];
        const tagState = state.tags[tag];
        values.push({
            tag,
            implementation: participantTagResources[tag].implementation,
            inputValue: tagInputValue,
            state: tagState,
        });
    }

    for (let tagStr of Object.keys(participantInput.tags)) {
        const tag: ParticipantTag = Number(tagStr);
        if (tag === FlagshipTag.FLAGSHIP) continue; // Flagship has custom handling, see below.
        const tagInputValue: any = participantInput.tags[tag];
        const tagState = state.tags[tag];
        values.push({
            tag,
            implementation: participantTagResources[tag].implementation,
            inputValue: tagInputValue,
            state: tagState,
        });
    }
    // Add the flagship effect if the flagship is part of the fleet and has a special effect.
    if (state.units.some((u) => u.type === UnitType.Flagship)) {
        const flagshipEffect: ParticipantTagImplementation | undefined = flagshipDefinitions[participantInput.faction].effect;
        if (flagshipEffect) {
            const tagInputValue: any = participantInput.tags[FlagshipTag.FLAGSHIP];
            const tagState = state.tags[FlagshipTag.FLAGSHIP];
            values.push({
                tag: FlagshipTag.FLAGSHIP,
                implementation: flagshipEffect,
                inputValue: tagInputValue,
                state: tagState,
            });
        }
    }
    values.push({
        tag: ConstantTag.PLANETARY_SHIELD,
        implementation: participantTagResources[ConstantTag.PLANETARY_SHIELD].implementation,
        inputValue: undefined,
        state: undefined,
    });
    return values;
}

export function getCombatRollsForStage(def: UnitDefinition, stage: CombatStage, role: ParticipantRole, combatType: CombatType): number {
    switch (stage) {
        case CombatStage.SpaceMines:
            return 0;
        case CombatStage.Bombardment:
            return role === ParticipantRole.Attacker ? def.bombardment : 0;
        case CombatStage.SpaceCannon:
            return def.spaceCannon;
        case CombatStage.InvasionDefence:
            return role === ParticipantRole.Defender ? def.invasionDefence : 0;
        case CombatStage.StartOfBattle:
            return 0;
        case CombatStage.AntiFighterBarrage:
            return def.antiFigherBarrage;
        case CombatStage.PreCombat:
            return def.preCombatShots;
        case CombatStage.Round1:
        case CombatStage.Round2:
        case CombatStage.RoundN:
            return unitIsCombatant(def.type, combatType) ? def.combatRolls : 0;
    }
}

function getHitTypeForStage(def: UnitDefinition, stage: CombatStage): HitType {
    switch (stage) {
        case CombatStage.AntiFighterBarrage:
            return HitType.AssignToFighter;
    }
    return HitType.Normal;
}

const sustainDamageReductionStages: CombatStage[] = [CombatStage.Bombardment, CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

function adjustCombatRollsForSustainDamage(stage: CombatStage, units: ComputedUnitSnapshot[]) {
    if (sustainDamageReductionStages.includes(stage)) {
        for (let unit of units) {
            if (unit.rolls > 0 && unit.sustainedHits > 0) {
                unit.rolls = max([unit.rolls - unit.sustainedHits, 1])!;
            }
        }
    }
}

function calculateHits(
    combatState: CombatState,
    calculationInput: CalculationInput,
    role: ParticipantRole,
    units: ComputedUnitSnapshot[]
): HitsProbabilityOutcome[] {
    const hits: SparseDictionary<number, number[]> = {};
    // let hitChances: number[] = [1.0]; // Initial probability: 100% chance for 0 hits.
    for (let unit of units) {
        const hitProbability: number = getUnitHitProbability(unit.combatValue);
        const rolls: number = unit.rolls;
        const maskedHitType: number = maskHitType(unit.hitType, unit.combatValue);
        for (let i = 0; i < rolls; i++) {
            // Initial probability: 100% chance for 0 hits.
            hits[maskedHitType] = addHitChance(hits[maskedHitType] ?? [1.0], hitProbability);
        }
        for (let nonStandardRoll of unit.nonStandardRolls) {
            const nonStandardCombatValue: number = unit.combatValue + nonStandardRoll.valueMod;
            const nonStandardHitType: number = maskHitType(unit.hitType, nonStandardCombatValue);
            const modifiedHitProbability: number = getUnitHitProbability(nonStandardCombatValue);
            hits[nonStandardHitType] = addHitChance(hits[nonStandardHitType] ?? [1.0], modifiedHitProbability);
        }
    }

    let outcomes: HitsProbabilityIntermediateOutcome[] = [{ hits: {}, probability: 1.0 }];
    for (let hitTypeStr of Object.keys(hits)) {
        const maskedHitType: HitType = Number(hitTypeStr);
        const probabilities: number[] = hits[maskedHitType]!;
        outcomes = outcomes
            .map((prev: HitsProbabilityIntermediateOutcome) =>
                probabilities.map(
                    (p: number, idx): HitsProbabilityIntermediateOutcome => ({
                        hits: {
                            ...prev.hits,
                            [maskedHitType]: {
                                hits: idx,
                                rolls: probabilities.length - 1,
                            },
                        },
                        probability: prev.probability * p,
                    })
                )
            )
            .flatMap((arr) => arr);
    }

    outcomes = applyOnCalculateHitsTags(combatState, calculationInput, role, outcomes);

    return outcomes.map(toHitProbabilityOutcome);
}

function toHitProbabilityOutcome(intermediateOutcome: HitsProbabilityIntermediateOutcome): HitsProbabilityOutcome {
    return {
        probability: intermediateOutcome.probability,
        hits: Object.fromEntries(
            Object.keys(intermediateOutcome.hits).map((k: string) => {
                const key: number = Number(k);
                return [key, intermediateOutcome.hits[key]?.hits];
            })
        ),
    };
}

export function maskHitType(hitType: HitType, combatValue: number): number {
    let maskedCombatValue: number = leftShiftWithMask(combatValue, HIT_TYPE_AND_FLAGS_BITMASK);
    return hitType | maskedCombatValue;
}

export function unmaskHitType(maskedHitType: number): { hitType: HitType; combatValue: number } {
    let hitType: HitType = maskedHitType & HIT_TYPE_BITMASK;
    let combatValue: number = rightShiftWithMask(maskedHitType, HIT_TYPE_AND_FLAGS_BITMASK);
    return { hitType, combatValue };
}

export function getUnitHitProbability(combatValue: number): number {
    return clamp((11 - combatValue) / 10, 0.0, 1.0);
}

function applyOnCalculateHitsTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    role: ParticipantRole,
    outcomes: HitsProbabilityIntermediateOutcome[]
): HitsProbabilityIntermediateOutcome[] {
    let newOutcomes: HitsProbabilityIntermediateOutcome[] = outcomes;

    const participant: ParticipantState = combatState[role];
    const participantInput: ParticipantInput = calculationInput[role];
    const tagValues: ParticipantTagValueAndState[] = getParticipantTagValues(calculationInput, participantInput, participant);

    for (let { implementation, state } of tagValues) {
        if (!!implementation && !!implementation.onCalculateHits) {
            const outcomesForTag: HitsProbabilityIntermediateOutcome[] = [];
            for (let outcome of newOutcomes) {
                const effectInput: OnCalculateHitsInput = {
                    calculationInput,
                    combatState,
                    role,
                    outcome,
                    tagState: state,
                };
                const { newOutcomes } = implementation.onCalculateHits(effectInput);
                if (newOutcomes) {
                    outcomesForTag.push(...newOutcomes);
                } else {
                    outcomesForTag.push(outcome);
                }
            }
            newOutcomes = outcomesForTag;
        }
    }
    return newOutcomes;
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

function assignHits(
    combatState: CombatState,
    input: CalculationInput,
    role: ParticipantRole,
    units: ComputedUnitSnapshot[],
    hits: SparseDictionary<HitType, number>
): CombatState {
    ({ combatState, hits, units } = applyPreAssignHitTags(combatState, input, role, units, hits));
    ({ combatState, hits, units } = applyOpponentPreAssignHitTags(combatState, input, getOpponentRole(role), units, hits));
    const newUnits: ComputedUnitSnapshot[] = [...units];
    for (let hitTypeStr of Object.keys(hits)) {
        const hitType: HitType = Number(hitTypeStr);
        const numberOfHits: number = hits[hitType]!;
        for (let i = 0; i < numberOfHits; i++) {
            assignHit(combatState, input, newUnits, hitType);
        }
    }

    return combatState.setParticipantUnits(
        role,
        newUnits.map((u) => u.base)
    );
}

interface ApplyPreAssignHitTagsResponse {
    combatState: CombatState;
    hits: SparseDictionary<HitType, number>;
    units: ComputedUnitSnapshot[];
}

function applyPreAssignHitTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    role: ParticipantRole,
    units: ComputedUnitSnapshot[],
    hits: SparseDictionary<HitType, number>
): ApplyPreAssignHitTagsResponse {
    let modifiedCombatState: CombatState = combatState;
    let modifiedHits: SparseDictionary<HitType, number> = hits;
    let modifiedUnits: ComputedUnitSnapshot[] = units;
    const participant: ParticipantState = combatState[role];
    const participantInput: ParticipantInput = calculationInput[role];
    const tagValues: ParticipantTagValueAndState[] = getParticipantTagValues(calculationInput, participantInput, participant);
    for (let { tag, implementation, state } of tagValues) {
        if (!!implementation && !!implementation.preAssignHits) {
            const effectInput: PreAssignHitsInput = {
                calculationInput,
                combatState: modifiedCombatState,
                role,
                hits: modifiedHits,
                units,
                tagState: state,
            };
            const { newHits, newUnits, newTagState } = implementation.preAssignHits(effectInput);
            if (newHits !== undefined) {
                modifiedHits = newHits;
            }
            if (newTagState !== undefined) {
                modifiedCombatState = modifiedCombatState.setParticipantTagValue(role, tag, newTagState);
            }
            if (newUnits !== undefined) {
                modifiedUnits = newUnits;
            }
        }
    }
    return {
        combatState: modifiedCombatState,
        hits: modifiedHits,
        units: modifiedUnits,
    };
}

function applyOpponentPreAssignHitTags(
    combatState: CombatState,
    calculationInput: CalculationInput,
    opponentRole: ParticipantRole,
    units: ComputedUnitSnapshot[],
    hits: SparseDictionary<HitType, number>
): ApplyPreAssignHitTagsResponse {
    let modifiedCombatState: CombatState = combatState;
    let modifiedHits: SparseDictionary<HitType, number> = hits;
    let modifiedUnits: ComputedUnitSnapshot[] = units;
    const opponent: ParticipantState = combatState[opponentRole];
    const opponentInput: ParticipantInput = calculationInput[opponentRole];
    const opponentTagValues: ParticipantTagValueAndState[] = getParticipantTagValues(calculationInput, opponentInput, opponent);
    for (let { tag, implementation, state } of opponentTagValues) {
        if (!!implementation && !!implementation.preAssignOpponentHits) {
            const effectInput: PreAssignHitsInput = {
                calculationInput,
                combatState: modifiedCombatState,
                role: opponentRole,
                hits: modifiedHits,
                units,
                tagState: state,
            };
            const { newHits, newUnits, newTagState } = implementation.preAssignOpponentHits(effectInput);
            if (newHits !== undefined) {
                modifiedHits = newHits;
            }
            if (newTagState !== undefined) {
                modifiedCombatState = modifiedCombatState.setParticipantTagValue(opponentRole, tag, newTagState);
            }
            if (newUnits !== undefined) {
                modifiedUnits = newUnits;
            }
        }
    }
    return {
        combatState: modifiedCombatState,
        hits: modifiedHits,
        units: modifiedUnits,
    };
}

function assignHit(combatState: CombatState, input: CalculationInput, units: ComputedUnitSnapshot[], hitType: HitType) {
    const hitIndex: number = determineHitTarget(combatState, input, units, hitType);
    if (hitIndex !== -1) {
        // account for "can't assign fighter hits" etc.? Loop list until we find a unit that it can be assigned to?
        const selectedUnit: ComputedUnitSnapshot | undefined = units[hitIndex];
        if (selectedUnit) {
            if (!canSustainWithoutDying(selectedUnit, combatState.stage)) {
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
 *
 * -1 indicates that no unit can suffer the hit.
 * @param units
 */
export function determineHitTarget(
    combatState: CombatState,
    input: CalculationInput,
    units: ComputedUnitSnapshot[],
    hitType: HitType
): number {
    let maxPrioIndex: number = -1;
    let maxPrioValue: number = NaN;
    for (let i = 0; i < units.length; i++) {
        if (!canAssignHitToUnit(units[i].base, hitType, input.combatType)) continue;
        const prio = calculateHitPriority(units[i], hitType, combatState.stage);
        if (isNaN(maxPrioValue) || prio > maxPrioValue) {
            maxPrioIndex = i;
            maxPrioValue = prio;
        }
    }
    return maxPrioIndex;
}

export function canAssignHitToUnit(unit: UnitState, hitType: HitType, combatType: CombatType): boolean {
    if (!unitIsCombatant(unit.type, combatType)) return false;

    switch (hitType & HIT_TYPE_BITMASK) {
        case HitType.AssignToFighter:
            return unit.type === UnitType.Fighter;
        case HitType.AssignToNonFighter:
            return unit.type !== UnitType.Fighter;
        case HitType.AssignToNonFighterFirst:
        case HitType.Normal:
        default:
            return true;
    }
}

export function unitIsCombatant(unitType: UnitType, combatType: CombatType): boolean {
    return unitDefinitions[unitType].combatantIn.includes(combatType);
}

function calculateHitPriority(unit: ComputedUnitSnapshot, hitType: HitType, stage: CombatStage): number {
    let priority: number = unit.combatValue;
    if (hitType === HitType.AssignToNonFighterFirst && unit.type === UnitType.Fighter) {
        // Fighters can't be assigned AssignToNonFighterFirst hits
        priority -= 100;
    }
    if (stage === CombatStage.Bombardment && unit.type === UnitType.Mech) {
        // Mechs must take Bombardment hits first
        priority += 100;
    }
    if (combatRoundStages.includes(stage) && unit.type === UnitType.ShockTroop) {
        // Shock troops must take hits first in normal combat rounds
        priority += 100;
    }
    if (unit.rolls === 0) {
        // Units unable to perform combat rolls (i.e. fighters in an Ion Storm) should be prioritized first when assigning hits
        priority += 10;
    }
    if (unit.base.hasTag(UnitTag.ADMIRAL)) {
        // If an unit has an admiral, it should not be assigned hits before other units with the same combat value
        priority -= 0.5;
    }
    if (canSustainWithoutDying(unit, stage)) {
        // Units that can sustain hits should be assigned hits first
        priority += 10;
    } else if (unit.base.hasTag(UnitTag.KEEP_ALIVE)) {
        // Units with the KEEP_ALIVE tag that can't sustain any more hits should not be assigned hits before other units, if possible.
        priority -= 20;
    }
    return priority;
}

export const defaultCancelHitPriorityOrder: HitType[] = [
    HitType.AssignToNonFighterFirst,
    HitType.AssignToNonFighter,
    HitType.Normal,
    HitType.AssignToFighter,
];

export function enumerateHitTypesByPriorityOrder(hits: SparseDictionary<HitType, number>, priorityOrder: HitType[]): HitType[] {
    return Object.keys(hits)
        .map((s) => Number(s) as HitType)
        .filter((hitType: HitType) => priorityOrder.includes(hitType & HIT_TYPE_BITMASK))
        .sort((a: HitType, b: HitType) => priorityOrder.indexOf(a & HIT_TYPE_BITMASK) - priorityOrder.indexOf(b & HIT_TYPE_BITMASK));
}

function canSustainWithoutDying(unit: ComputedUnitSnapshot, stage: CombatStage): boolean {
    if (unit.type === UnitType.Mech && stage === CombatStage.Bombardment) return false;

    return unit.sustainedHits < unit.sustainDamage;
}

export function calculateAverageHits(hitChances: number[]): number {
    return round(
        hitChances.reduce((prev, curr, i) => prev + curr * i, 0),
        2
    );
}

function popNextActiveState(dict: CombatStateDictionary, combatType: CombatType): CombatStateProbability | undefined {
    let next: CombatStateProbability | undefined = undefined;
    let nextUnitCount: number = 0;
    let nextDictKey: string = "";
    let nextArrayIdx: number = 0;

    for (let key of Object.keys(dict)) {
        for (let i = 0; i < dict[key].length; i++) {
            const stateProbability: CombatStateProbability = dict[key][i];
            if (!combatStateIsFinished(stateProbability.state, combatType)) {
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

function combatStateIsFinished(state: CombatState, combatType: CombatType): boolean {
    return determineVictor(state, combatType) !== undefined;
}

type CombatStateLike = { [key in ParticipantRole]: { units: UnitInput[] } } & { stage: CombatStage };
function determineVictor(state: CombatStateLike, combatType: CombatType): CombatVictor | undefined {
    const attackerAlive: boolean = participantIsAlive(state.attacker.units, combatType, state.stage);
    const defenderAlive: boolean = participantIsAlive(state.defender.units, combatType, state.stage);
    if (!attackerAlive) {
        if (!defenderAlive) {
            return "draw";
        }
        return ParticipantRole.Defender;
    }
    if (!defenderAlive) {
        return ParticipantRole.Attacker;
    }
    return undefined;
}

function participantIsAlive(units: UnitInput[], combatType: CombatType, combatStage: CombatStage): boolean {
    switch (combatStage) {
        case CombatStage.SpaceMines:
        case CombatStage.Bombardment:
        case CombatStage.SpaceCannon:
        case CombatStage.InvasionDefence:
            // Non-combatant abilities might still need to be resolved
            return units.length > 0;
        default:
            return units.filter((u) => unitIsCombatant(u.type, combatType)).length > 0;
    }
}

function appendCombatStateProbabilities(combatStateDictionary: CombatStateDictionary, stateProbabilities: CombatStateProbability[]) {
    for (let stateProbability of stateProbabilities) {
        appendCombatStateProbability(combatStateDictionary, stateProbability);
    }
}

function appendCombatStateProbability(combatStateDictionary: CombatStateDictionary, stateProbability: CombatStateProbability) {
    const hash: number = stateProbability.state.hash;
    const list: CombatStateProbability[] | undefined = combatStateDictionary[hash];
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
        combatStateDictionary[hash] = [stateProbability];
    }
}

function addStatesByStage(
    statesByStage: SparseDictionary<CombatStage, CombatStateProbability[]>,
    initialProbability: number,
    stateProbabilities: CombatStateProbability[]
) {
    // Gather intermediate statistics for all stages up until RoundN
    for (let stateProbability of stateProbabilities.filter((sp) => sp.state.stage !== CombatStage.RoundN)) {
        // Clone to prevent mutation issues
        const clone: CombatStateProbability = {
            ...stateProbability,
        };
        const statesByStageList: CombatStateProbability[] | undefined = statesByStage[clone.state.stage];
        if (statesByStageList) {
            statesByStageList.push(clone);
        } else {
            statesByStage[clone.state.stage] = [clone];
        }
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

function createCalculationOutput(
    stateDictionary: CombatStateDictionary,
    statesByStage: SparseDictionary<CombatStage, CombatStateProbability[]>,
    input: CalculationInput
): CalculationOutput {
    const resultStates: CombatStateProbability[] = Object.values(stateDictionary).flat();
    const resultStatesOutput: CombatStateProbabilityOutput[] = toCombatStateProbabilityOutputs(resultStates, input);
    const victorProbabilities: KeyedDictionary<CombatVictor, number> = getVictorProbabilities(input, resultStatesOutput);

    return {
        victorProbabilities: victorProbabilities,
        finalStates: resultStatesOutput,
        stages: createCombatStageOutputs(statesByStage, input),
        statistics: {
            [ParticipantRole.Attacker]: calculateOutputStatistics(ParticipantRole.Attacker, resultStatesOutput, input),
            [ParticipantRole.Defender]: calculateOutputStatistics(ParticipantRole.Defender, resultStatesOutput, input),
        },
    };
}

function toCombatStateProbabilityOutputs(
    stateProbabilities: CombatStateProbability[],
    input: CalculationInput
): CombatStateProbabilityOutput[] {
    return stateProbabilities.map(
        (resultProbability: CombatStateProbability): CombatStateProbabilityOutput => ({
            probability: resultProbability.probability,
            state: resultProbability.state.toOutput(input),
        })
    );
}

function createCombatStageOutputs(
    statesByStage: SparseDictionary<CombatStage, CombatStateProbability[]>,
    input: CalculationInput
): SparseDictionary<CombatStage, CombatStageOutput> {
    // We can't generate intermediate statistics for Round2 and RoundN, since RoundN is repeating
    const outputStages: CombatStage[] = combatStagesByCombatType[input.combatType].filter(
        (s) => s !== CombatStage.Round2 && s !== CombatStage.RoundN
    );
    const outputs: SparseDictionary<CombatStage, CombatStageOutput> = {};

    const byStage: SparseDictionary<CombatStage, CombatStateProbability[]> = Object.fromEntries(
        Object.keys(statesByStage).map((key) => [key, statesByStage[Number(key) as CombatStage]!])
    );
    let previousVictorProbabilities: KeyedDictionary<CombatVictor, number> | undefined = undefined;

    for (let stage of outputStages) {
        const beforeStates: CombatStateProbability[] | undefined = byStage[stage];
        const afterStates: CombatStateProbability[] | undefined = byStage[getNextStage(input.combatType, stage)];
        if (!beforeStates || !afterStates) continue;

        const beforeStatesOutput: CombatStateProbabilityOutput[] = toCombatStateProbabilityOutputs(beforeStates, input);
        const afterStatesOutput: CombatStateProbabilityOutput[] = toCombatStateProbabilityOutputs(afterStates, input);

        const statistics: KeyedDictionary<ParticipantRole, CombatStageParticipantStatistics> = {
            [ParticipantRole.Attacker]: calculateCombatStageParticipantStatistics(
                ParticipantRole.Attacker,
                beforeStates,
                afterStates,
                afterStatesOutput,
                input,
                stage
            ),
            [ParticipantRole.Defender]: calculateCombatStageParticipantStatistics(
                ParticipantRole.Defender,
                beforeStates,
                afterStates,
                afterStatesOutput,
                input,
                stage
            ),
        };
        if (Object.values(statistics).every((stat) => equalsZero(stat.expectedHits) && equalsZero(stat.assignedHits))) continue;

        let victorProbabilities: KeyedDictionary<CombatVictor, number> = getVictorProbabilities(input, afterStatesOutput);
        if (previousVictorProbabilities) {
            victorProbabilities = mergeVictorProbabilities(previousVictorProbabilities, victorProbabilities);
        }
        previousVictorProbabilities = victorProbabilities;

        outputs[stage] = {
            beforeStates: beforeStatesOutput,
            afterStates: afterStatesOutput,
            victorProbabilities,
            statistics,
        };
    }

    return outputs;
}

function calculateCombatStageParticipantStatistics(
    role: ParticipantRole,
    beforeStates: CombatStateProbability[],
    afterStates: CombatStateProbability[],
    afterStatesOutput: CombatStateProbabilityOutput[],
    input: CalculationInput,
    stage: CombatStage
): CombatStageParticipantStatistics {
    const opponent: ParticipantRole = getOpponentRole(role);
    const totalProbabilityBefore = sum(beforeStates.map((sp) => sp.probability));
    let expectedHits: number = 0;
    let opponentHealthBefore: number = 0;
    let opponentHealthAfter: number = 0;
    for (let stateProbability of beforeStates) {
        const units: ComputedUnitSnapshot[] = getUnitSnapshots(stateProbability.state, input, role, stage);
        const expHits: number = sum(units.map(getUnitExpectedHits));
        expectedHits += expHits * stateProbability.probability;

        const opponentUnits: ComputedUnitSnapshot[] = getUnitSnapshots(stateProbability.state, input, opponent, stage);
        const health: number = getTotalUnitHealth(opponentUnits, input.combatType) * stateProbability.probability;
        opponentHealthBefore += health;
        if (determineVictor(stateProbability.state, input.combatType) === opponent) {
            opponentHealthAfter += health;
        }
    }
    for (let stateProbability of afterStates) {
        const opponentUnits: ComputedUnitSnapshot[] = getUnitSnapshots(stateProbability.state, input, opponent, stage);
        opponentHealthAfter += getTotalUnitHealth(opponentUnits, input.combatType) * stateProbability.probability;
    }
    return {
        expectedHits: expectedHits / totalProbabilityBefore,
        assignedHits: (opponentHealthBefore - opponentHealthAfter) / totalProbabilityBefore,
        survivingUnitProbabilities: getSurvivingUnitsStatistics(afterStatesOutput, role, input.combatType),
    };
}

function calculateOutputStatistics(
    role: ParticipantRole,
    afterStatesOutput: CombatStateProbabilityOutput[],
    input: CalculationInput
): CalculationOutputStatistics {
    return {
        survivingUnitProbabilities: getSurvivingUnitsStatistics(afterStatesOutput, role, input.combatType),
    };
}

function getSurvivingUnitsStatistics(
    stateProbabilities: CombatStateProbabilityOutput[],
    participant: ParticipantRole,
    combatType: CombatType
): SurvivingUnitsStatistics[] {
    const unitProbabilities: SurvivingUnitsStatistics[] = [];

    for (let stateProbability of stateProbabilities) {
        const units: UnitInput[] = stateProbability.state[participant].units;
        const existingEntry: SurvivingUnitsStatistics | undefined = unitProbabilities.find((u) => isEqual(u.units, units));
        if (existingEntry) {
            existingEntry.probability += stateProbability.probability;
        } else {
            const newEntry: SurvivingUnitsStatistics = {
                units,
                totalHealth: getTotalUnitInputHealth(units, combatType),
                sustainedHits: sum(stateProbability.state[participant].units.map((u) => u.sustainedHits + (u.usedPlanetaryShields ?? 0))),
                probability: stateProbability.probability,
                probabilityThisOrBetter: 0,
                probabilityThisOrWorse: 0,
            };
            unitProbabilities.push(newEntry);
        }
    }
    unitProbabilities.sort(unitHealthComparer(combatType));

    let aggregatedProbability: number = 0;
    for (let unitProbability of unitProbabilities) {
        unitProbability.probabilityThisOrWorse = 1.0 - aggregatedProbability;
        aggregatedProbability += unitProbability.probability;
        unitProbability.probabilityThisOrBetter = aggregatedProbability;
    }

    return unitProbabilities;
}

function getUnitExpectedHits(unit: ComputedUnitSnapshot): number {
    return (
        getUnitHitProbability(unit.combatValue) * unit.rolls +
        sum(unit.nonStandardRolls.map((r) => getUnitHitProbability(unit.combatValue + r.valueMod)))
    );
}

export function getTotalUnitHealth(units: ComputedUnitSnapshot[], combatType: CombatType) {
    return sum(units.filter((u) => unitIsCombatant(u.type, combatType)).map(getUnitHealth));
}

export function getTotalUnitInputHealth(units: UnitInput[], combatType: CombatType): number {
    return sum(
        units.filter((u) => unitIsCombatant(u.type, combatType)).map((u) => unitDefinitions[u.type].sustainDamage - u.sustainedHits + 1)
    );
}

function getUnitHealth(unit: ComputedUnitSnapshot): number {
    return unit.sustainDamage - unit.sustainedHits + 1;
}

function unitHealthComparer(combatType: CombatType): (a: SurvivingUnitsStatistics, b: SurvivingUnitsStatistics) => number {
    return (a: SurvivingUnitsStatistics, b: SurvivingUnitsStatistics): number => {
        const unitCountA: number = a.units.length;
        const unitCountB: number = b.units.length;
        if (unitCountA !== unitCountB) return unitCountB - unitCountA;

        const unitHealthA: number = getTotalUnitInputHealth(a.units, combatType);
        const unitHealthB: number = getTotalUnitInputHealth(b.units, combatType);
        return unitHealthB - unitHealthA;
    };
}

export function getVictorProbabilities(
    input: CalculationInput,
    combatStates: CombatStateProbabilityOutput[]
): KeyedDictionary<CombatVictor, number> {
    const victorProbabilities: KeyedDictionary<CombatVictor, number> = {
        attacker: 0,
        defender: 0,
        draw: 0,
    };
    for (let state of combatStates) {
        const victor: CombatVictor | undefined = determineVictor(state.state, input.combatType);
        if (victor) {
            victorProbabilities[victor] += state.probability;
        }
    }
    return victorProbabilities;
}

export function mergeVictorProbabilities(
    first: KeyedDictionary<CombatVictor, number>,
    second: KeyedDictionary<CombatVictor, number>
): KeyedDictionary<CombatVictor, number> {
    return {
        attacker: first.attacker + second.attacker,
        defender: first.defender + second.defender,
        draw: first.draw + second.draw,
    };
}
