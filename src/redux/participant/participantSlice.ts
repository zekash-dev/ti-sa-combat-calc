import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getInitialState, getUnitSnapshots } from "logic/calculator";
import { uniqueFilter } from "logic/common";
import { getSelectableUnitTypes, grantDefaultFactionAbilities, unitSizeComparer } from "logic/participant";
import {
    CalculationInput,
    CombatStage,
    combatStagesByCombatType,
    CombatType,
    ParticipantInput,
    ParticipantRole,
    RichParticipant,
    RichParticipantsInput,
    RichUnit,
    UnitInput,
    UnitStageStats,
} from "model/calculation";
import { CombatState, ComputedUnitSnapshot, UnitSnapshotTag } from "model/combatState";
import { Faction, ParticipantTag, UnitTag } from "model/combatTags";
import { KeyedDictionary, SparseDictionary } from "model/common";
import { UnitType } from "model/unit";
import { RootState } from "redux/store";

export interface ParticipantSliceState {
    combatType: CombatType;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export const initialState: ParticipantSliceState = {
    combatType: CombatType.SpaceBattle,
    participants: {
        attacker: {
            faction: Faction.EMIRATES_OF_HACAN,
            units: [],
            tags: grantDefaultFactionAbilities({}, Faction.EMIRATES_OF_HACAN),
        },
        defender: {
            faction: Faction.WINNU_SOVEREIGNTY,
            units: [],
            tags: grantDefaultFactionAbilities({}, Faction.WINNU_SOVEREIGNTY),
        },
    },
};

interface SetFactionPayload {
    role: ParticipantRole;
    faction: Faction;
}

interface SetTagPayload {
    role: ParticipantRole;
    key: ParticipantTag;
    value: any;
}

interface UnsetTagPayload {
    role: ParticipantRole;
    key: ParticipantTag;
}

interface ModifyUnitCountPayload {
    role: ParticipantRole;
    unit: UnitType;
}

interface SetUnitCountPayload extends ModifyUnitCountPayload {
    count: number;
}

interface SetUnitTagPayload {
    role: ParticipantRole;
    unitIndex: number;
    tag: UnitTag;
    value: any;
}

interface UnsetUnitTagPayload {
    role: ParticipantRole;
    unitIndex: number;
    tag: UnitTag;
}

interface SetUnitSustainedHitsPayload {
    role: ParticipantRole;
    unitIndex: number;
    sustainedHits: number;
}

const participantSlice = createSlice({
    name: "participant",
    initialState: initialState,
    reducers: {
        setCombatType: (state: ParticipantSliceState, action: PayloadAction<CombatType>) => {
            state.combatType = action.payload;
            state.participants.attacker.units = filterBySelectableUnitTypes(state, ParticipantRole.Attacker);
            state.participants.defender.units = filterBySelectableUnitTypes(state, ParticipantRole.Defender);
        },
        setFaction: (state: ParticipantSliceState, action: PayloadAction<SetFactionPayload>) => {
            const { role, faction } = action.payload;
            state.participants[role].faction = faction;
            state.participants[role].tags = grantDefaultFactionAbilities(state.participants[role].tags, faction);
        },
        setParticipantTag: (state: ParticipantSliceState, action: PayloadAction<SetTagPayload>) => {
            const { role, key, value } = action.payload;
            if (typeof key === "number") {
                state.participants[role].tags[key as ParticipantTag] = value;
            }
        },
        unsetParticipantTag: (state: ParticipantSliceState, action: PayloadAction<UnsetTagPayload>) => {
            const { role, key } = action.payload;
            delete state.participants[role].tags[key];
        },
        clearParticipantUnits: (state: ParticipantSliceState, action: PayloadAction<ParticipantRole>) => {
            state.participants[action.payload].units = [];
        },
        clearParticipantUnitsOfType: (state: ParticipantSliceState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            state.participants[role].units = state.participants[role].units.filter((u) => u.type !== unit);
        },
        incrementUnitCount: (state: ParticipantSliceState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            addUnits(state.participants[role], unit, 1);
        },
        decrementUnitCount: (state: ParticipantSliceState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            removeUnits(state.participants[role], unit, 1);
        },
        setUnitCount: (state: ParticipantSliceState, action: PayloadAction<SetUnitCountPayload>) => {
            const { unit, role, count } = action.payload;
            const currentCount: number = getUnitCount(state.participants[role], unit);
            if (count > currentCount) {
                addUnits(state.participants[role], unit, count - currentCount);
            } else {
                removeUnits(state.participants[role], unit, currentCount - count);
            }
        },
        setUnitTag: (state: ParticipantSliceState, action: PayloadAction<SetUnitTagPayload>) => {
            const { role, unitIndex, tag, value } = action.payload;
            const unit: UnitInput | undefined = state.participants[role].units[unitIndex];
            if (unit) {
                if (!unit.tags) {
                    unit.tags = {};
                }
                unit.tags[tag] = value;
            }
        },
        unsetUnitTag: (state: ParticipantSliceState, action: PayloadAction<UnsetUnitTagPayload>) => {
            const { role, unitIndex, tag } = action.payload;
            const unit: UnitInput | undefined = state.participants[role].units[unitIndex];
            if (unit) {
                if (unit.tags) {
                    delete unit.tags[tag];
                }
            }
        },
        setUnitSustainedHits: (state: ParticipantSliceState, action: PayloadAction<SetUnitSustainedHitsPayload>) => {
            const { role, unitIndex, sustainedHits } = action.payload;
            const unit: UnitInput | undefined = state.participants[role].units[unitIndex];
            if (unit) {
                unit.sustainedHits = sustainedHits;
            }
        },
    },
});

function filterBySelectableUnitTypes(state: ParticipantSliceState, role: ParticipantRole): UnitInput[] {
    const calculationInput: CalculationInput = toCalculationInput(state);
    const selectableUnitTypes: UnitType[] = getSelectableUnitTypes(calculationInput, role);
    return state.participants[role].units.filter((u: UnitInput) => selectableUnitTypes.includes(u.type));
}

export function getUnitCount(participant: ParticipantInput, unitType: UnitType): number {
    return participant.units.filter((u) => u.type === unitType).length;
}

function addUnits(participant: ParticipantInput, unitType: UnitType, count: number) {
    for (let i = 0; i < count; i++) {
        participant.units.push({ type: unitType, sustainedHits: 0 });
    }
}

function removeUnits(participant: ParticipantInput, unitType: UnitType, count: number) {
    for (let i = 0; i < count; i++) {
        const idx: number = determineRemovalIndex(participant.units, unitType);
        if (idx !== -1) {
            participant.units.splice(idx, 1);
        } else {
            break;
        }
    }
}

/**
 * Prioritize keeping units with:
 * 1) tags applied to them
 * 2) hits sustained
 */
function determineRemovalIndex(units: UnitInput[], unitType: UnitType): number {
    let maxPrioIndex: number = -1;
    let maxPrioValue: number = -1;
    for (let i = 0; i < units.length; i++) {
        const unit: UnitInput = units[i];
        if (unit.type !== unitType) continue;
        const tagCount = unit.tags === undefined ? 0 : Object.keys(unit.tags).length;
        const prio = 100 - tagCount * 2 - unit.sustainedHits;
        if (prio > maxPrioValue) {
            maxPrioIndex = i;
            maxPrioValue = prio;
        }
    }
    return maxPrioIndex;
}

export const {
    setCombatType,
    setFaction,
    setParticipantTag,
    unsetParticipantTag,
    clearParticipantUnits,
    clearParticipantUnitsOfType,
    incrementUnitCount,
    decrementUnitCount,
    setUnitCount,
    setUnitTag,
    unsetUnitTag,
    setUnitSustainedHits,
} = participantSlice.actions;

export const selectParticipantState = (rootState: RootState) => rootState.participant;
export const selectCombatType = (rootState: RootState): CombatType => rootState.participant.combatType;
export const selectParticipants = (rootState: RootState): KeyedDictionary<ParticipantRole, ParticipantInput> =>
    rootState.participant.participants;
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export const selectCalculationInput = createSelector([selectParticipantState], toCalculationInput);

function toCalculationInput(sliceState: ParticipantSliceState): CalculationInput {
    return {
        combatType: sliceState.combatType,
        attacker: sliceState.participants.attacker,
        defender: sliceState.participants.defender,
    };
}

export const selectRichParticipantsInput = createSelector(
    [selectCalculationInput],
    (calculationInput: CalculationInput): RichParticipantsInput => {
        return {
            [ParticipantRole.Attacker]: createRichParticipantInput(calculationInput, ParticipantRole.Attacker),
            [ParticipantRole.Defender]: createRichParticipantInput(calculationInput, ParticipantRole.Defender),
        };
    }
);

function createRichParticipantInput(calculationInput: CalculationInput, role: ParticipantRole): RichParticipant {
    return {
        faction: calculationInput[role].faction,
        tags: calculationInput[role].tags,
        units: createRichUnits(calculationInput, role),
    };
}

function createRichUnits(calculationInput: CalculationInput, role: ParticipantRole): RichUnit[] {
    const combatState: CombatState = getInitialState(calculationInput);
    const participant: ParticipantInput = calculationInput[role];
    const richUnits: RichUnit[] = [];
    const snapshotsByStage: SparseDictionary<CombatStage, ComputedUnitSnapshot>[] = Array.from(participant.units.map(() => ({})));
    const combatStages: CombatStage[] = combatStagesByCombatType[calculationInput.combatType];

    for (let stage of combatStages) {
        const snapshots: ComputedUnitSnapshot[] = getUnitSnapshots(combatState, calculationInput, role, stage);
        for (let i = 0; i < participant.units.length; i++) {
            snapshotsByStage[i][stage] = snapshots[i];
        }
    }
    for (let i = 0; i < participant.units.length; i++) {
        const unit: UnitInput = participant.units[i];
        const snapshots: SparseDictionary<CombatStage, ComputedUnitSnapshot> = snapshotsByStage[i];

        const baseline: UnitStageStats | undefined = createUnitStageStats(snapshots[CombatStage.RoundN], undefined, CombatStage.RoundN);
        const byStage: SparseDictionary<CombatStage, UnitStageStats> = {};
        for (let stage of combatStages.filter((s): s is CombatStage => s !== CombatStage.RoundN)) {
            const snapshot: ComputedUnitSnapshot | undefined = snapshots[stage];
            if (!snapshot) continue;
            const stageDescription: UnitStageStats | undefined = createUnitStageStats(snapshot, baseline, stage);
            if (stageDescription) {
                byStage[stage] = stageDescription;
            }
        }

        const tagEffects: UnitSnapshotTag[] = Object.values(snapshots)
            .flatMap((s) => s.tagEffects)
            .filter(uniqueFilter);

        richUnits.push({
            input: unit,
            unitIndex: i,
            baseline,
            byStage,
            tagEffects,
        });
    }

    richUnits.sort(unitSizeComparer);
    return richUnits;
}

function createUnitStageStats(
    snapshot: ComputedUnitSnapshot | undefined,
    baseline: UnitStageStats | undefined,
    stage: CombatStage
): UnitStageStats | undefined {
    if (!snapshot) return undefined;

    const stageStats: UnitStageStats = {
        rolls: [...Array(snapshot.rolls)]
            .map(() => snapshot.combatValue)
            .concat(snapshot.nonStandardRolls.map((r) => snapshot.combatValue + r.valueMod)),
        hitType: snapshot.hitType,
        sustainDamage: snapshot.sustainDamage,
    };

    if (
        // If R1/R2 are the same as RoundN, no need to display them separately
        (stage === CombatStage.Round1 || stage === CombatStage.Round2) &&
        baseline &&
        unitStageStatsAreEqual(stageStats, baseline)
    ) {
        return undefined;
    }

    return stageStats;
}

function unitStageStatsAreEqual(a: UnitStageStats, b: UnitStageStats): boolean {
    if (a.rolls.length !== b.rolls.length) return false;
    if (a.hitType !== b.hitType) return false;
    for (let i = 0; i < a.rolls.length; i++) {
        if (a.rolls[i] !== b.rolls[i]) return false;
    }
    return true;
}

export default participantSlice.reducer;
