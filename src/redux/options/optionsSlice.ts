import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAllEnumValues } from "logic/common";
import { CombatStage } from "model/calculation";
import { SparseDictionary } from "model/common";

import { AppThunk, RootState } from "redux/store";

const OPTIONS_STORAGE_KEY = "tisacc_options";

export interface OptionsState {
    devMode: boolean;
    useSearchParam: boolean;
    showStatistics: SparseDictionary<CombatStage, boolean>;
}

export const defaultState: OptionsState = {
    devMode: false,
    useSearchParam: true,
    showStatistics: {},
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
export const selectShowStatistics = (rootState: RootState): SparseDictionary<CombatStage, boolean> => rootState.options.showStatistics;

export const selectShowStatisticsSettingState = createSelector([selectShowStatistics], (showStatistics): "all" | "none" | "some" => {
    const selectedKeysCount: number = Object.values(showStatistics).filter((val) => val === true).length;
    if (selectedKeysCount === 0) return "none";
    if (selectedKeysCount === getAllEnumValues(CombatStage).length) return "all";
    return "some";
});

export const selectShowStatisticsForStage = (stage: CombatStage) => (rootState: RootState) =>
    selectShowStatistics(rootState)[stage] ?? false;

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

export const setShowStatisticsForStage =
    (stage: CombatStage, value: boolean): AppThunk =>
    (dispatch, getState) => {
        dispatch(
            updateOptions({
                showStatistics: {
                    ...getState().options.showStatistics,
                    [stage]: value,
                },
            })
        );
    };

export const setShowStatisticsForAllStages =
    (value: boolean): AppThunk =>
    (dispatch, getState) => {
        dispatch(
            updateOptions({
                showStatistics: value
                    ? Object.fromEntries(getAllEnumValues<CombatStage>(CombatStage).map((stage: CombatStage) => [stage, true]))
                    : {},
            })
        );
    };
function saveOptionsToLocalStorage(options: OptionsState) {
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options));
}

function getOptionsFromLocalStorage(): OptionsState | undefined {
    const json: string | null = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (json && json.length) {
        return {
            ...defaultState,
            ...JSON.parse(json),
        };
    }
}

export default optionsSlice.reducer;
