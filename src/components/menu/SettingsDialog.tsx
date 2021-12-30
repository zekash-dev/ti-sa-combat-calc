import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Typography,
} from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { OptionsState, selectOptions, updateOptions } from "redux/options/optionsSlice";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function SettingsDialog({ open, onClose }: Props) {
    const dispatch = useDispatch();
    const options: OptionsState = useSelector(selectOptions);

    const onBooleanChanged = (key: keyof OptionsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            updateOptions({
                [key]: e.target.checked,
            })
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Typography variant="h4" color="text.primary">
                    Settings
                </Typography>
            </DialogTitle>
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
                </DialogContent>
            </OverlayScrollbarsComponent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
