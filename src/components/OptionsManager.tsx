import { Box, Button, CircularProgress, Grid, MenuItem, TextField } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectIterations, setIterations } from "redux/options/optionsSlice";
import { selectSimulating } from "redux/result/resultSlice";
import { runSimulation } from "redux/thunks/runSimulation";

export function OptionsManager() {
    const dispatch = useDispatch();
    const iterations: number = useSelector(selectIterations);
    const simulating: boolean = useSelector(selectSimulating);
    const allowedValues: number[] = [10, 100, 1000, 10000];

    const handleChangeIterations = (event: any) => {
        dispatch(setIterations(event.target.value));
    };

    const onClickSimulate = () => {
        dispatch(runSimulation());
    };

    return (
        <Box sx={{ width: 400, p: 4 }}>
            <h2>OPTIONS</h2>
            <Grid>
                <TextField
                    select
                    label="Iterations"
                    value={iterations}
                    onChange={handleChangeIterations}
                    helperText="Select number of iterations"
                >
                    {allowedValues.map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid>
                <Button variant="contained" onClick={onClickSimulate} disabled={simulating}>
                    Run simulations
                </Button>
            </Grid>
            {simulating && (
                <Grid sx={{ p: 1 }}>
                    <CircularProgress />
                </Grid>
            )}
        </Box>
    );
}
