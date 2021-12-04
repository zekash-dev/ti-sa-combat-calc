import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
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
        <Box sx={{ width: 400, p: 4 }}>
            <Typography variant="h2">OPTIONS</Typography>
            <Grid>
                <Button variant="contained" onClick={onClickCalculate} disabled={calculating}>
                    Run calculation
                </Button>
            </Grid>
            {calculating && (
                <Grid sx={{ p: 1 }}>
                    <CircularProgress />
                </Grid>
            )}
        </Box>
    );
}
