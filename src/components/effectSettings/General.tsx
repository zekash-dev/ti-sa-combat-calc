import { Switch, TableBody, TableCell, TableRow, Typography } from "@mui/material";

import { UnstyledSmallTable } from "components/common";
import { GeneralSettings } from "logic/effects";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function General({ settings, onSettingsChange }: ParticipantTagCustomSettingsUiProps<GeneralSettings>) {
    const onToggleEnableRerolls = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
            ...settings,
            enableRerolls: e.target.checked,
        });
    };
    return (
        <UnstyledSmallTable>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <Typography>Enable reroll</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                        <Switch disableRipple size="small" checked={settings.enableRerolls} onChange={onToggleEnableRerolls} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </UnstyledSmallTable>
    );
}
