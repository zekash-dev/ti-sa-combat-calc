import { Switch, Table, TableCell, TableRow, Typography } from "@mui/material";
import { styled } from "@mui/system";

import { IncrementalNumberInput } from "components/input/IncrementalNumberInput";
import { MentakAdaptableOrdnanceRigsSettings } from "logic/effects/mentakAdaptableOrdnanceRigs";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function MentakAdaptableOrdnanceRigs({
    settings,
    onSettingsChange,
}: ParticipantTagCustomSettingsUiProps<MentakAdaptableOrdnanceRigsSettings>) {
    const onToggleUseSustain = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
            ...settings,
            useSustain: e.target.checked,
        });
    };
    const onCarryingChanged = (newValue: number) => {
        onSettingsChange({
            ...settings,
            cruisersCarryingGroundForces: newValue,
        });
    };
    return (
        <UnstyledTable size="small">
            <TableRow>
                <TableCell>
                    <Typography>Cruisers carrying GF</Typography>
                </TableCell>
                <TableCell>
                    <IncrementalNumberInput value={settings.cruisersCarryingGroundForces} onChange={onCarryingChanged} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    <Typography>Use sustain ability</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Switch disableRipple size="small" checked={settings.useSustain} onChange={onToggleUseSustain} />
                </TableCell>
            </TableRow>
        </UnstyledTable>
    );
}

const UnstyledTable = styled(Table)({
    "& td": {
        padding: "unset",
        border: "none",
        justifyContent: "center",
    },
});
