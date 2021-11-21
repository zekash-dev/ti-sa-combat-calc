import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Faction, KeyedDictionary, Participant, ParticipantRole, UnitMap, UnitType } from "model/common";
import { RootState } from "redux/store";

export interface ParticipantState {
    participants: KeyedDictionary<ParticipantRole, Participant>;
}

export const initialState: ParticipantState = {
    participants: {
        attacker: {
            faction: Faction.Hacan,
            units: {},
        },
        defender: {
            faction: Faction.JolNar,
            units: {},
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
            state.participants[action.payload].units = {};
        },
        clearParticipantUnitsOfType: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            delete state.participants[role].units[unit];
        },
        incrementUnitCount: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            const unitMap: UnitMap = state.participants[role].units;
            unitMap[unit] = (unitMap[unit] ?? 0) + 1;
        },
        decrementUnitCount: (state: ParticipantState, action: PayloadAction<ModifyUnitCountPayload>) => {
            const { unit, role } = action.payload;
            const unitMap: UnitMap = state.participants[role].units;
            unitMap[unit] = (unitMap[unit] ?? 0) - 1;
            if (unitMap[unit]! < 1) {
                delete unitMap[unit];
            }
        },
        setUnitCount: (state: ParticipantState, action: PayloadAction<SetUnitCountPayload>) => {
            const { unit, role, count } = action.payload;
            const unitMap: UnitMap = state.participants[role].units;
            unitMap[unit] = count;
        },
    },
});

export const { setFaction, clearParticipantUnits, clearParticipantUnitsOfType, incrementUnitCount, decrementUnitCount, setUnitCount } =
    participantSlice.actions;

export const selectparticipantState = (rootState: RootState) => rootState.participant;
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export default participantSlice.reducer;
