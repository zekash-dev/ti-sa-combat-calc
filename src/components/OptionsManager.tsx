import { PlayArrow } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectCalculating } from "redux/result/resultSlice";
import { runCalculation } from "redux/thunks/runCalculation";

export function OptionsManager() {
    const dispatch = useDispatch();
    const calculating: boolean = useSelector(selectCalculating);

    const onClickCalculate = () => {
        dispatch(runCalculation());
    };

    return (
        <Button variant="contained" onClick={onClickCalculate} disabled={calculating} sx={{ height: 40, width: 80 }}>
            {calculating ? <CircularProgress size={20} color="primary" /> : <PlayArrow />}
        </Button>
    );
}
