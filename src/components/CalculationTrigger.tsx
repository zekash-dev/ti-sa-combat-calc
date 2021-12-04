import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectparticipantState } from "redux/participant/participantSlice";
import { runCalculation } from "redux/thunks/runCalculation";

export function CalculationTrigger() {
    const dispatch = useDispatch();
    const participantState = useSelector(selectparticipantState);
    useEffect(() => {
        dispatch(runCalculation());
    }, [dispatch, participantState]);
    return null;
}
