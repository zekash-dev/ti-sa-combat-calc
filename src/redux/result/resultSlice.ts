import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CalculationOutput } from "model/calculation";
import { RootState } from "redux/store";

export interface ResultState {
    output: CalculationOutput | null;
    calculating: boolean;
    pending: boolean;
}

export const initialState: ResultState = {
    output: null,
    calculating: false,
    pending: false,
};

interface SetResultPayload {
    output: CalculationOutput | null;
}

const resultSlice = createSlice({
    name: "result",
    initialState: initialState,
    reducers: {
        setOutput: (state: ResultState, action: PayloadAction<SetResultPayload>) => {
            const { output } = action.payload;
            if (!state.pending) {
                state.output = output;
                state.calculating = false;
            }
        },
        setCalculating: (state: ResultState, action: Action) => {
            state.calculating = true;
            state.pending = false;
        },
        setPending: (state: ResultState, action: Action) => {
            state.pending = true;
        },
    },
});

export const { setCalculating, setPending, setOutput } = resultSlice.actions;

export const selectOutput = (rootState: RootState) => rootState.result.output;
export const selectCalculating = (rootState: RootState) => rootState.result.calculating;
export const selectPending = (rootState: RootState) => rootState.result.pending;

export default resultSlice.reducer;
