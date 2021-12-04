import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CalculationOutput } from "model/calculation";
import { RootState } from "redux/store";

export interface ResultState {
    output: CalculationOutput | null;
    calculating: boolean;
    calculationKey: string;
}

export const initialState: ResultState = {
    output: null,
    calculating: false,
    calculationKey: "",
};

interface StartCalculationPayload {
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

export const { setCalculating, setOutput } = resultSlice.actions;

export const selectOutput = (rootState: RootState) => rootState.result.output;
export const selectCalculating = (rootState: RootState) => rootState.result.calculating;

export default resultSlice.reducer;
