import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CalculationInput, Faction, KeyedDictionary, ParticipantInput, ParticipantRole, UnitType } from "model/common";
import { RootState } from "redux/store";

export interface ParticipantState {
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export const initialState: ParticipantState = {
    participants: {
        attacker: {
            faction: Faction.Hacan,
            units: [],
            tags: {},
        },
        defender: {
            faction: Faction.JolNar,
            units: [],
            tags: {},
        },
    },
};

interface SetFactionPayload {
    role: ParticipantRole;
    faction: Faction;
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
            const { faction, role } = action.payload;
            state.participants[role].faction = faction;
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

export const { setFaction, clearParticipantUnits, clearParticipantUnitsOfType, incrementUnitCount, decrementUnitCount, setUnitCount } =
    participantSlice.actions;

export const selectparticipantState = (rootState: RootState) => rootState.participant;
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export const selectCalculationInput = createSelector([selectparticipantState], (participantState): CalculationInput => {
    return {
        attacker: participantState.participants.attacker,
        defender: participantState.participants.defender,
    };
});

export default participantSlice.reducer;
