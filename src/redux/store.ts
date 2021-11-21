import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import participantReducer, { ParticipantState, initialState as initialParticipantState } from "./participant/participantSlice";
import resultReducer, { ResultState, initialState as initialResultState } from "./result/resultSlice";

export default configureStore({
    reducer: {
        participant: participantReducer,
        result: resultReducer,
    },
});

export interface RootState {
    participant: ParticipantState;
    result: ResultState;
}

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const initialState: RootState = {
    participant: initialParticipantState,
    result: initialResultState,
};
