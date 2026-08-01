import { TableBody, TableCell, TableRow, Typography } from "@mui/material";

import { IncrementalNumberInput, UnstyledSmallTable } from "components/common";
import { LetnevSaimocInfusedHullsSettings } from "logic/effects";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";

export function LetnevSaimocInfusedHulls({
    settings,
    onSettingsChange,
}: ParticipantTagCustomSettingsUiProps<LetnevSaimocInfusedHullsSettings>) {
    const onMaxRepairCountChanged = (newValue: number) => {
        onSettingsChange({
            maxRepairCount: newValue,
        });
    };
    return (
        <UnstyledSmallTable>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <Typography>Max usages</Typography>
                    </TableCell>
                    <TableCell>
                        <IncrementalNumberInput value={settings.maxRepairCount} onChange={onMaxRepairCountChanged} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </UnstyledSmallTable>
    );
}
