import { Switch, TableBody, TableCell, TableRow, Typography } from "@mui/material";

import { UnstyledSmallTable } from "components/common";
import { YinIndoctrinateSettings } from "logic/effects";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function YinIndoctrinate({ settings, onSettingsChange }: ParticipantTagCustomSettingsUiProps<YinIndoctrinateSettings>) {
    const onToggleShipPresent = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
            ...settings,
            shipPresent: e.target.checked,
        });
    };
    return (
        <UnstyledSmallTable>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <Typography>Ship present</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                        <Switch disableRipple size="small" checked={settings.shipPresent} onChange={onToggleShipPresent} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </UnstyledSmallTable>
    );
}
