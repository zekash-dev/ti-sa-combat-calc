import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIterations } from "redux/options/optionsSlice";

import { selectparticipantState } from "redux/participant/participantSlice";
import { runSimulation } from "redux/thunks/runSimulation";

export function SimulationTrigger() {
    const dispatch = useDispatch();
    const participantState = useSelector(selectparticipantState);
    const iterations = useSelector(selectIterations);
    useEffect(() => {
        dispatch(runSimulation());
    }, [dispatch, participantState, iterations]);
    return null;
}
