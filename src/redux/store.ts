import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import optionsReducer, { defaultState as initialOptionsState, OptionsState } from "./options/optionsSlice";
import participantReducer, { initialState as initialParticipantState, ParticipantSliceState } from "./participant/participantSlice";
import resultReducer, { initialState as initialResultState, ResultState } from "./result/resultSlice";

const store = configureStore({
    reducer: {
        options: optionsReducer,
        participant: participantReducer,
        result: resultReducer,
    },
});

export default store;

export interface RootState {
    options: OptionsState;
    participant: ParticipantSliceState;
    result: ResultState;
}

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const initialState: RootState = {
    options: initialOptionsState,
    participant: initialParticipantState,
    result: initialResultState,
};
