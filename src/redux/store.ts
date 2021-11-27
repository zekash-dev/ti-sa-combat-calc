import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import optionsReducer, { OptionsState, initialState as initialOptionsState } from "./options/optionsSlice";
import participantReducer, { ParticipantState, initialState as initialParticipantState } from "./participant/participantSlice";
import resultReducer, { ResultState, initialState as initialResultState } from "./result/resultSlice";

export default configureStore({
    reducer: {
        options: optionsReducer,
        participant: participantReducer,
        result: resultReducer,
    },
});

export interface RootState {
    options: OptionsState;
    participant: ParticipantState;
    result: ResultState;
}

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const initialState: RootState = {
    options: initialOptionsState,
    participant: initialParticipantState,
    result: initialResultState,
};
