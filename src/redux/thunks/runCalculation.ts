import { v4 as uuidV4 } from "uuid";

import { OutcomeInstance } from "model/common";
import { ParticipantState, selectparticipantState } from "redux/participant/participantSlice";
import { setCalculating, setResult } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

import Worker from "worker";

const worker = new Worker();

export const runCalculation = (): AppThunk => async (dispatch, getState) => {
    const calculationKey: string = uuidV4();
    dispatch(setCalculating({ calculationKey }));
    const participantState: ParticipantState = selectparticipantState(getState());

    const outcomes: OutcomeInstance[] = await worker.runCalculationWorker(
        participantState.participants.attacker,
        participantState.participants.defender
    );
    dispatch(setResult({ calculationKey, outcomes }));
};
