import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "redux/store";

export interface OptionsState {
    iterations: number;
}

export const initialState: OptionsState = {
    iterations: 1000,
};

const optionsSlice = createSlice({
    name: "options",
    initialState: initialState,
    reducers: {
        setIterations: (state: OptionsState, action: PayloadAction<number>) => {
            state.iterations = action.payload;
        },
    },
});

export const { setIterations } = optionsSlice.actions;

export const selectIterations = (rootState: RootState): number => rootState.options.iterations;

export default optionsSlice.reducer;
