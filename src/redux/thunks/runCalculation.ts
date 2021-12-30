import Worker from "worker";

import { CalculationInput, CalculationOutput } from "model/calculation";
import { selectCalculationInput } from "redux/participant/participantSlice";
import { selectCalculating, selectPending, setCalculating, setOutput, setPending } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

const worker = new Worker();

export const runCalculation = (): AppThunk => async (dispatch, getState) => {
    // If a calculation is in progress, set "pending=true" and return
    if (selectCalculating(getState())) {
        dispatch(setPending());
        return;
    }
    // Run a calculation
    while (true) {
        dispatch(setCalculating());
        const input: CalculationInput = selectCalculationInput(getState());
        const output: CalculationOutput | null = await worker.runCalculationWorker(input);
        // If no new calculation has been set as pending, send the output to state
        if (!selectPending(getState())) {
            dispatch(setOutput({ output }));
            break;
        }
        // If a calculation was set as pending while this calculation was in progress, discard the results and start over
    }
};
