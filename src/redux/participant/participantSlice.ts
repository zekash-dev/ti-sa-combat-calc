import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getInitialParticipantState, getUnitSnapshots } from "logic/calculator";
import { uniqueFilter } from "logic/common";
import { grantDefaultFactionAbilities, unitSizeComparer } from "logic/participant";
import {
    allCombatStages,
    CalculationInput,
    CombatStage,
    ParticipantInput,
    ParticipantRole,
    RichParticipant,
    RichParticipantsInput,
    RichUnit,
    UnitInput,
    UnitStageStats,
} from "model/calculation";
import { ComputedUnitSnapshot, ParticipantState, UnitSnapshotTag } from "model/combatState";
import { Faction, ParticipantTag } from "model/combatTags";
import { KeyedDictionary, SparseDictionary } from "model/common";
import { UnitType } from "model/unit";
import { RootState } from "redux/store";

export interface ParticipantSliceState {
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export const initialState: ParticipantSliceState = {
    participants: {
        attacker: {
            faction: Faction.EMIRATES_OF_HACAN,
            units: [],
            tags: grantDefaultFactionAbilities({}, Faction.EMIRATES_OF_HACAN),
        },
        defender: {
            faction: Faction.UNIVERSITIES_OF_JOLNAR,
            units: [],
            tags: grantDefaultFactionAbilities({}, Faction.UNIVERSITIES_OF_JOLNAR),
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

const participantSlice = createSlice({
    name: "participant",
    initialState: initialState,
    reducers: {
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
    },
});

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
        const idx: number = participant.units.findIndex((u) => u.type === unitType);
        if (idx !== -1) {
            participant.units.splice(idx, 1);
        } else {
            break;
        }
    }
}

export const {
    setFaction,
    setParticipantTag,
    unsetParticipantTag,
    clearParticipantUnits,
    clearParticipantUnitsOfType,
    incrementUnitCount,
    decrementUnitCount,
    setUnitCount,
} = participantSlice.actions;

export const selectparticipantState = (rootState: RootState) => rootState.participant;
export const selectparticipants = (rootState: RootState): KeyedDictionary<ParticipantRole, ParticipantInput> =>
    rootState.participant.participants;
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export const selectCalculationInput = createSelector([selectparticipantState], (participantState): CalculationInput => {
    return {
        attacker: participantState.participants.attacker,
        defender: participantState.participants.defender,
    };
});

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
    const participant: ParticipantInput = calculationInput[role];
    const participantState: ParticipantState = getInitialParticipantState(participant);
    const richUnits: RichUnit[] = [];
    const snapshotsByStage: SparseDictionary<CombatStage, ComputedUnitSnapshot>[] = Array.from(participant.units.map(() => ({})));

    for (let stage of allCombatStages) {
        const snapshots: ComputedUnitSnapshot[] = getUnitSnapshots(participantState, calculationInput, role, stage);
        for (let i = 0; i < participant.units.length; i++) {
            snapshotsByStage[i][stage] = snapshots[i];
        }
    }
    for (let i = 0; i < participant.units.length; i++) {
        const unit: UnitInput = participant.units[i];
        const snapshots: SparseDictionary<CombatStage, ComputedUnitSnapshot> = snapshotsByStage[i];

        const baseline: UnitStageStats | undefined = createUnitStageStats(snapshots[CombatStage.RoundN], undefined, CombatStage.RoundN);
        const byStage: SparseDictionary<CombatStage, UnitStageStats> = {};
        for (let stage of allCombatStages.filter((s): s is CombatStage => s !== CombatStage.RoundN)) {
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
        combatValue: snapshot.combatValue,
        rolls: snapshot.rolls,
        hitType: snapshot.hitType,
    };

    if (stageStats.rolls === 0) return undefined;

    if (
        // If R1/R2 are the same as RoundN, no need to display them separately
        (stage === CombatStage.Round1 || stage === CombatStage.Round2) &&
        stageStats.combatValue === baseline?.combatValue &&
        stageStats.rolls === baseline?.rolls &&
        stageStats.hitType === baseline?.hitType
    ) {
        return undefined;
    }

    return stageStats;
}

export default participantSlice.reducer;
