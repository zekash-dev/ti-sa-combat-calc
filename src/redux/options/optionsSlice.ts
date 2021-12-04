import { createSlice } from "@reduxjs/toolkit";

import { RootState } from "redux/store";

export interface OptionsState {}

export const initialState: OptionsState = {};

const optionsSlice = createSlice({
    name: "options",
    initialState: initialState,
    reducers: {},
});

export const selectOptions = (rootState: RootState): OptionsState => rootState.options;

export default optionsSlice.reducer;
