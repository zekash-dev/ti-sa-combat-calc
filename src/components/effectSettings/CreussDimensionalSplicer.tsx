import { Switch, TableCell, TableRow, Typography } from "@mui/material";

import { UnstyledSmallTable } from "components/common";
import { CreussDimensionalSplicerSettings } from "logic/effects";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function CreussDimensionalSplicer({
    settings,
    onSettingsChange,
}: ParticipantTagCustomSettingsUiProps<CreussDimensionalSplicerSettings>) {
    const onToggleWormholePresent = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
            ...settings,
            wormholePresent: e.target.checked,
        });
    };
    return (
        <UnstyledSmallTable>
            <TableRow>
                <TableCell>
                    <Typography>Wormhole present</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Switch disableRipple size="small" checked={settings.wormholePresent} onChange={onToggleWormholePresent} />
                </TableCell>
            </TableRow>
        </UnstyledSmallTable>
    );
}
