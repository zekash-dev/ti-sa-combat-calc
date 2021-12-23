import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "redux/store";

const OPTIONS_STORAGE_KEY = "tisacc_options";

export interface OptionsState {
    devMode: boolean;
}

export const defaultState: OptionsState = {
    devMode: false,
};

const optionsSlice = createSlice({
    name: "options",
    initialState: getOptionsFromLocalStorage() ?? defaultState,
    reducers: {
        setOptions: (state: OptionsState, action: PayloadAction<OptionsState>) => {
            return action.payload;
        },
    },
});

export const selectOptions = (rootState: RootState): OptionsState => rootState.options;
export const selectDevMode = (rootState: RootState): boolean => rootState.options.devMode;

export const updateOptions =
    (partialOptions: Partial<OptionsState>): AppThunk =>
    (dispatch, getState) => {
        const newOptions: OptionsState = {
            ...getState().options,
            ...partialOptions,
        };

        saveOptionsToLocalStorage(newOptions);
        dispatch(optionsSlice.actions.setOptions(newOptions));
    };

function saveOptionsToLocalStorage(options: OptionsState) {
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options));
}

function getOptionsFromLocalStorage(): OptionsState | undefined {
    const json: string | null = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (json && json.length) {
        return JSON.parse(json);
    }
}

export default optionsSlice.reducer;
