import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CalculationOutput } from "model/common";
import { RootState } from "redux/store";

export interface ResultState {
    output: CalculationOutput | null;
    simulating: boolean;
    calculationKey: string;
}

export const initialState: ResultState = {
    output: null,
    simulating: false,
    calculationKey: "",
};

interface StartSimulationPayload {
    calculationKey: string;
}

interface SetResultPayload {
    calculationKey: string;
    output: CalculationOutput;
}

const resultSlice = createSlice({
    name: "result",
    initialState: initialState,
    reducers: {
        setOutput: (state: ResultState, action: PayloadAction<SetResultPayload>) => {
            const { calculationKey, output: results } = action.payload;
            if (calculationKey === state.calculationKey) {
                state.output = results;
                state.simulating = false;
            }
        },
        setSimulating: (state: ResultState, action: PayloadAction<StartSimulationPayload>) => {
            const { calculationKey } = action.payload;
            state.calculationKey = calculationKey;
            state.simulating = true;
        },
    },
});

export const { setSimulating, setOutput } = resultSlice.actions;

export const selectOutput = (rootState: RootState) => rootState.result.output;
export const selectSimulating = (rootState: RootState) => rootState.result.simulating;

export default resultSlice.reducer;
