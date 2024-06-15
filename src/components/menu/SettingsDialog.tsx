import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Slider,
    Typography,
} from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    OptionsState,
    selectOptions,
    selectShowStatisticsSettingState,
    setShowStatisticsForAllStages,
    updateOptions,
} from "redux/options/optionsSlice";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function SettingsDialog({ open, onClose }: Props) {
    const dispatch = useDispatch();
    const options: OptionsState = useSelector(selectOptions);
    const showStatistics: "all" | "none" | "some" = useSelector(selectShowStatisticsSettingState);
    const [currentSimplificationTarget, setCurrentSimplificationTarget] = useState<number>(options.simplificationTarget);

    const handleBooleanChanged = useCallback(
        (key: keyof OptionsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(
                updateOptions({
                    [key]: e.target.checked,
                })
            );
        },
        [dispatch]
    );

    const HandleToggleShowStatistics = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = showStatistics !== "all";
            dispatch(setShowStatisticsForAllStages(newValue));
        },
        [dispatch, showStatistics]
    );

    const updateCurrentSimplificationTarget = useCallback((_event: unknown, value: number | number[]) => {
        if (typeof value === "number") {
            setCurrentSimplificationTarget(value);
        }
    }, []);

    const commitSimplificationTarget = useCallback(
        (_event: unknown, value: number | number[]) => {
            if (typeof value === "number") {
                dispatch(
                    updateOptions({
                        simplificationTarget: value,
                    })
                );
            }
        },
        [dispatch]
    );

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle color="text.primary">Settings</DialogTitle>
            <OverlayScrollbarsComponent>
                <DialogContent sx={{ minWidth: 600 }}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={options.devMode} onChange={handleBooleanChanged("devMode")} />}
                            label="Developer mode"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={options.useSearchParam} onChange={handleBooleanChanged("useSearchParam")} />}
                            label="Auto-update URL"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showStatistics === "all"}
                                    indeterminate={showStatistics === "some"}
                                    onChange={HandleToggleShowStatistics}
                                />
                            }
                            label="Show output statistics"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={options.useSimplification} onChange={handleBooleanChanged("useSimplification")} />}
                            label="Simplify calculation"
                        />
                    </FormGroup>
                    {options.useSimplification && (
                        <Box sx={{ ml: 4 }}>
                            <Typography variant="body1" sx={{ fontSize: "0.9em" }}>
                                Maximum number of branches
                            </Typography>
                            <Slider
                                value={currentSimplificationTarget}
                                onChange={updateCurrentSimplificationTarget}
                                onChangeCommitted={commitSimplificationTarget}
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                min={2}
                                max={10}
                            />
                            <Typography variant="body2" sx={{ fontSize: "0.8em", color: "text.secondary" }}>
                                In each step of the calculation, the number of possible outcomes will be limited to this number, while
                                retaining approximately the same average. A lower value results in a faster calculation with a less accurate
                                result.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </OverlayScrollbarsComponent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
