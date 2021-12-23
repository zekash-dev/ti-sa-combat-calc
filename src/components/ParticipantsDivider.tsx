import { PlayArrow } from "@mui/icons-material";
import { CircularProgress, Fab } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectDevMode } from "redux/options/optionsSlice";
import { selectCalculating } from "redux/result/resultSlice";
import { runCalculation } from "redux/thunks/runCalculation";

export function ParticipantsDivider() {
    const dispatch = useDispatch();
    const calculating: boolean = useSelector(selectCalculating);
    const devMode: boolean = useSelector(selectDevMode);

    const onClickCalculate = () => {
        dispatch(runCalculation());
    };
    return (
        <div
            style={{
                width: 2,
                height: "100%",
                position: "absolute",
                backgroundColor: "#999",
                top: 0,
                left: "calc(50% - 1px)",
            }}
        >
            {(devMode || calculating) && (
                <Fab
                    onClick={onClickCalculate}
                    disabled={calculating}
                    color="primary"
                    sx={{
                        position: "absolute",
                        width: 60,
                        height: 60,
                        top: "calc(50% - 30px)",
                        left: "-29px",
                        "&.Mui-disabled": { backgroundColor: "#303030" },
                    }}
                >
                    {calculating ? <CircularProgress size={30} color="primary" /> : <PlayArrow />}
                </Fab>
            )}
        </div>
    );
}
