import { v4 as uuidV4 } from "uuid";

import { ParticipantRole } from "model/common";
import { ParticipantState, selectparticipantState } from "redux/participant/participantSlice";
import { setCalculating, setResult } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

export const runCalculation = (): AppThunk => (dispatch, getState) => {
    const calculationKey: string = uuidV4();
    dispatch(setCalculating({ calculationKey }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const participantState: ParticipantState = selectparticipantState(getState());

    setTimeout(() => {
        dispatch(
            setResult({
                calculationKey,
                outcomes: [
                    {
                        propability: 0.5,
                        victor: ParticipantRole.Attacker,
                    },
                ],
            })
        );
    }, 500);
};
