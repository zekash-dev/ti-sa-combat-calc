import { v4 as uuidV4 } from "uuid";
import Worker from "worker";

import { CalculationInput, CalculationOutput } from "model/common";
import { selectCalculationInput } from "redux/participant/participantSlice";
import { setOutput, setSimulating } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

const worker = new Worker();

export const runSimulation = (): AppThunk => async (dispatch, getState) => {
    const calculationKey: string = uuidV4();
    dispatch(setSimulating({ calculationKey }));
    const input: CalculationInput = selectCalculationInput(getState());

    const output: CalculationOutput = await worker.runCalculationWorker(input);
    dispatch(setOutput({ calculationKey, output }));
};
