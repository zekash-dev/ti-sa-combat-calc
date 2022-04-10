import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React from "react";
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

    const onBooleanChanged = (key: keyof OptionsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            updateOptions({
                [key]: e.target.checked,
            })
        );
    };

    const onToggleShowStatistics = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = showStatistics !== "all";
        dispatch(setShowStatisticsForAllStages(newValue));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle color="text.primary">Settings</DialogTitle>
            <OverlayScrollbarsComponent>
                <DialogContent>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={options.devMode} onChange={onBooleanChanged("devMode")} />}
                            label="Developer mode"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={options.useSearchParam} onChange={onBooleanChanged("useSearchParam")} />}
                            label="Auto-update URL"
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showStatistics === "all"}
                                    indeterminate={showStatistics === "some"}
                                    onChange={onToggleShowStatistics}
                                />
                            }
                            label="Show output statistics"
                        />
                    </FormGroup>
                </DialogContent>
            </OverlayScrollbarsComponent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
