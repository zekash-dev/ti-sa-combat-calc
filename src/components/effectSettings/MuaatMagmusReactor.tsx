import { TableCell, TableRow, Typography } from "@mui/material";

import { IncrementalNumberInput, UnstyledSmallTable } from "components/common";
import { MuaatMagmusReactorSettings } from "logic/effects/muaatMagmusReactor";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function MuaatMagmusReactor({ settings, onSettingsChange }: ParticipantTagCustomSettingsUiProps<MuaatMagmusReactorSettings>) {
    const onWarSunCountChanged = (newValue: number) => {
        onSettingsChange({
            ...settings,
            warSunsLeavingSupernova: newValue,
        });
    };
    return (
        <UnstyledSmallTable>
            <TableRow>
                <TableCell>
                    <Typography>Affected war suns</Typography>
                </TableCell>
                <TableCell>
                    <IncrementalNumberInput value={settings.warSunsLeavingSupernova} onChange={onWarSunCountChanged} />
                </TableCell>
            </TableRow>
        </UnstyledSmallTable>
    );
}
