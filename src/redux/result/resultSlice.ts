import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { aggregateOutcomes } from "logic/calculator";

import { OutcomeInstance } from "model/common";
import { RootState } from "redux/store";

export interface ResultState {
    outcomes: OutcomeInstance[];
    calculating: boolean;
    calculationKey: string;
}

export const initialState: ResultState = {
    outcomes: [],
    calculating: false,
    calculationKey: "",
};

interface StartCalculationPayload {
    calculationKey: string;
}

interface SetResultPayload {
    calculationKey: string;
    outcomes: OutcomeInstance[];
}

const resultSlice = createSlice({
    name: "result",
    initialState: initialState,
    reducers: {
        setResult: (state: ResultState, action: PayloadAction<SetResultPayload>) => {
            const { calculationKey, outcomes } = action.payload;
            if (calculationKey === state.calculationKey) {
                state.outcomes = outcomes;
                state.calculating = false;
            }
        },
        setCalculating: (state: ResultState, action: PayloadAction<StartCalculationPayload>) => {
            const { calculationKey } = action.payload;
            state.calculationKey = calculationKey;
            state.calculating = true;
        },
    },
});

export const { setCalculating, setResult } = resultSlice.actions;

export const selectOutcomes = (rootState: RootState) => rootState.result.outcomes;
export const selectCalculating = (rootState: RootState) => rootState.result.calculating;

export const selectAggregateOutcomes = createSelector([selectOutcomes], (outcomes) => aggregateOutcomes(outcomes));

export default resultSlice.reducer;
