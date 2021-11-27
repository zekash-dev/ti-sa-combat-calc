import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { max } from "lodash";

import { unitDefinitions } from "logic/simulator";
import {
    CombatParticipant,
    CombatParticipants,
    Faction,
    KeyedDictionary,
    Participant,
    ParticipantRole,
    UnitMap,
    UnitType,
} from "model/common";
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
            unitMap[unit] = max([count, 0]);
        },
    },
});

export const { setFaction, clearParticipantUnits, clearParticipantUnitsOfType, incrementUnitCount, decrementUnitCount, setUnitCount } =
    participantSlice.actions;

export const selectparticipantState = (rootState: RootState) => rootState.participant;
export const selectParticipant = (role: ParticipantRole) => (rootState: RootState) => rootState.participant.participants[role];

export const selectCombatParticipants = createSelector([selectparticipantState], (participantState): CombatParticipants => {
    return {
        attacker: toCombatParticipant(participantState.participants.attacker),
        defender: toCombatParticipant(participantState.participants.defender),
    };
});

function toCombatParticipant(participant: Participant): CombatParticipant {
    const combatParticipant: CombatParticipant = {
        faction: participant.faction,
        units: [],
    };
    for (let unitType of Object.keys(participant.units)) {
        const unitCount: number | undefined = participant.units[unitType as UnitType];
        if (unitCount) {
            for (let i = 0; i < unitCount; i++) {
                combatParticipant.units.push({
                    ...unitDefinitions[unitType as UnitType],
                    alive: true,
                    scoredHits: [],
                });
            }
        }
    }
    return combatParticipant;
}

export default participantSlice.reducer;
