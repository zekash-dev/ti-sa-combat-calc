import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { grantDefaultFactionAbilities } from "logic/participant";
import { CalculationInput, ParticipantInput, ParticipantRole } from "model/calculation";
import { Faction, ParticipantTag } from "model/combatTags";
import { KeyedDictionary } from "model/common";
import { UnitType } from "model/unit";
import { RootState } from "redux/store";

export interface ParticipantState {
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export const initialState: ParticipantState = {
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
        setFaction: (state: ParticipantState, action: PayloadAction<SetFactionPayload>) => {
            const { role, faction } = action.payload;
            state.participants[role].faction = faction;
            state.participants[role].tags = grantDefaultFactionAbilities(state.participants[role].tags, faction);
        },
        setParticipantTag: (state: ParticipantState, action: PayloadAction<SetTagPayload>) => {
            const { role, key, value } = action.payload;
            if (typeof key === "number") {
                state.participants[role].tags[key as ParticipantTag] = value;
            }
        },
        unsetParticipantTag: (state: ParticipantState, action: PayloadAction<UnsetTagPayload>) => {
            const { role, key } = action.payload;
            delete state.participants[role].tags[key];
        },
        clearParticipantUnits: (state: ParticipantState, action: PayloadAction<ParticipantRole>) => {
            state.participants[action.payload].units = [];
        },
        clearParticipantUnitsOfType: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            state.participants[role].units = state.participants[role].units.filter((u) => u.type !== unit);
        },
        incrementUnitCount: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            addUnits(state.participants[role], unit, 1);
        },
        decrementUnitCount: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            removeUnits(state.participants[role], unit, 1);
        },
        setUnitCount: (state: ParticipantState, action: PayloadAction<SetUnitCountPayload>) => {
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
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export const selectCalculationInput = createSelector([selectparticipantState], (participantState): CalculationInput => {
    return {
        attacker: participantState.participants.attacker,
        defender: participantState.participants.defender,
    };
});

export default participantSlice.reducer;
