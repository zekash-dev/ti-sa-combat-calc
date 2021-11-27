import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { aggregateCombatResults } from "logic/simulator";

import { AggregatedCombatResult, SimulatedCombatResult } from "model/common";
import { RootState } from "redux/store";

export interface ResultState {
    results: SimulatedCombatResult[];
    simulating: boolean;
    simulationKey: string;
}

export const initialState: ResultState = {
    results: [],
    simulating: false,
    simulationKey: "",
};

interface StartSimulationPayload {
    simulationKey: string;
}

interface SetResultPayload {
    simulationKey: string;
    results: SimulatedCombatResult[];
}

const resultSlice = createSlice({
    name: "result",
    initialState: initialState,
    reducers: {
        setResult: (state: ResultState, action: PayloadAction<SetResultPayload>) => {
            const { simulationKey, results } = action.payload;
            if (simulationKey === state.simulationKey) {
                state.results = results;
                state.simulating = false;
            }
        },
        setSimulating: (state: ResultState, action: PayloadAction<StartSimulationPayload>) => {
            const { simulationKey } = action.payload;
            state.simulationKey = simulationKey;
            state.simulating = true;
        },
    },
});

export const { setSimulating, setResult } = resultSlice.actions;

export const selectResults = (rootState: RootState) => rootState.result.results;
export const selectSimulating = (rootState: RootState) => rootState.result.simulating;

export const selectAggregateResults = createSelector([selectResults], (results): AggregatedCombatResult[] =>
    aggregateCombatResults(results)
);

export default resultSlice.reducer;
