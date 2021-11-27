import { v4 as uuidV4 } from "uuid";
import Worker from "worker";

import { CombatParticipants, SimulatedCombatResult } from "model/common";
import { selectIterations } from "redux/options/optionsSlice";
import { selectCombatParticipants } from "redux/participant/participantSlice";
import { setSimulating, setResult } from "redux/result/resultSlice";
import { AppThunk } from "redux/store";

const worker = new Worker();

export const runSimulation = (): AppThunk => async (dispatch, getState) => {
    const calculationKey: string = uuidV4();
    dispatch(setSimulating({ simulationKey: calculationKey }));
    const participants: CombatParticipants = selectCombatParticipants(getState());
    const iterations: number = selectIterations(getState());

    const results: SimulatedCombatResult[] = await worker.runSimulationWorker(participants.attacker, participants.defender, iterations);
    dispatch(setResult({ simulationKey: calculationKey, results }));
};
