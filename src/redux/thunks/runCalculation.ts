import { v4 as uuidV4 } from "uuid";
import Worker from "worker";

import { CalculationInput, CalculationOutput } from "model/calculation";
import { selectCalculationInput } from "redux/participant/participantSlice";
import { setOutput, setCalculating } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

const worker = new Worker();

export const runCalculation = (): AppThunk => async (dispatch, getState) => {
    const calculationKey: string = uuidV4();
    dispatch(setCalculating({ calculationKey }));
    const input: CalculationInput = selectCalculationInput(getState());

    const output: CalculationOutput = await worker.runCalculationWorker(input);
    dispatch(setOutput({ calculationKey, output }));
};
