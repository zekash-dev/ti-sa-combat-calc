import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { ParticipantRole, RichUnit } from "model/calculation";
import { UnitTag } from "model/combatTags";
import { setUnitTag, unsetUnitTag } from "redux/participant/participantSlice";
import { useCallback } from "react";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitCombatRollsModInput({ role, unit }: Props) {
    const dispatch = useDispatch();

    const currentValue: number = Number(unit.input.tags?.[UnitTag.COMBAT_DICE_MOD] ?? 0);
    const currentValueDisplay = currentValue > 0 ? `+${currentValue}` : currentValue === 0 ? `±0` : String(currentValue);

    const setModValue = useCallback(
        (newValue: number) => {
            if (newValue >= 10 || newValue <= -10) return;

            if (newValue !== 0) {
                dispatch(
                    setUnitTag({
                        role: role,
                        unitIndex: unit.unitIndex,
                        tag: UnitTag.COMBAT_DICE_MOD,
                        value: newValue,
                    })
                );
            } else {
                dispatch(
                    unsetUnitTag({
                        role: role,
                        unitIndex: unit.unitIndex,
                        tag: UnitTag.COMBAT_DICE_MOD,
                    })
                );
            }
        },
        [dispatch, role, unit.unitIndex]
    );

    const handleIncrement = useCallback(() => setModValue(currentValue + 1), [setModValue, currentValue]);
    const handleDecrement = useCallback(() => setModValue(currentValue - 1), [setModValue, currentValue]);

    return (
        <Box display="flex" flexWrap="nowrap">
            <Typography
                variant="body2"
                flexGrow={1}
                sx={{
                    display: "inline",
                    marginRight: 1,
                    lineHeight: "30px",
                }}
            >
                Combat dice count
            </Typography>
            <IconButton size="small" onClick={handleDecrement}>
                <Remove sx={{ width: 20, height: 20 }} />
            </IconButton>
            <Tooltip
                title="Modify the number of combat rolls performed in normal combat rounds"
                placement="right"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, 30] } }] }}
            >
                <Box
                    sx={{
                        borderRadius: 1,
                        backgroundColor: getBackgroundColor(currentValue),
                        p: "0 4px",
                        m: "2px 0",
                        width: "39px",
                        fontFamily: "Consolas",
                        textAlign: "center",
                    }}
                >
                    {currentValueDisplay}
                </Box>
            </Tooltip>
            <IconButton size="small" onClick={handleIncrement}>
                <Add sx={{ width: 20, height: 20 }} />
            </IconButton>
        </Box>
    );
}

function getBackgroundColor(value: number): string {
    if (value >= 1) {
        return "#31B32B";
    }
    if (value <= -1) {
        return "#F4641D";
    }
    return "#666666";
}
