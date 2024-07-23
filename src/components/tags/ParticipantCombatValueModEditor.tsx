import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, ListItem, ListItemButton, Tooltip, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ParticipantInput, ParticipantRole } from "model/calculation";
import { CommonParticipantTag } from "model/combatTags";
import { selectParticipant, setParticipantTag, unsetParticipantTag } from "redux/participant/participantSlice";
import { ParticipantCombatValueModSettings, participantCombatValueMod } from "logic/effects/participantCombatValueMod";

interface Props {
    open: boolean;
    role: ParticipantRole;
}

export function ParticipantCombatValueModEditor({ role, open }: Props) {
    const dispatch = useDispatch();

    const participant: ParticipantInput = useSelector(selectParticipant(role));
    const tagSettings: ParticipantCombatValueModSettings =
        participant.tags[CommonParticipantTag.COMBAT_VALUE_MOD] ?? participantCombatValueMod.settings!.default;
    const currentValue = tagSettings.mod;
    const currentValueDisplay = currentValue > 0 ? `+${currentValue}` : currentValue === 0 ? `±0` : String(currentValue);

    const setModValue = useCallback(
        (newValue: number) => {
            if (newValue >= 10 || newValue <= -10) return;

            if (newValue !== 0) {
                const newSettings: ParticipantCombatValueModSettings = {
                    mod: newValue,
                };
                dispatch(setParticipantTag({ role, key: CommonParticipantTag.COMBAT_VALUE_MOD, value: newSettings }));
            } else {
                dispatch(unsetParticipantTag({ role, key: CommonParticipantTag.COMBAT_VALUE_MOD }));
            }
        },
        [dispatch, role]
    );

    const handleIncrement = useCallback(() => setModValue(currentValue + 1), [setModValue, currentValue]);
    const handleDecrement = useCallback(() => setModValue(currentValue - 1), [setModValue, currentValue]);

    if (open) {
        return (
            <>
                <ListItem sx={{ mt: 2, display: "flex" }}>
                    <Typography sx={{ flexGrow: 1 }}>Combat roll modifier</Typography>
                    <IconButton onClick={handleDecrement}>
                        <Remove />
                    </IconButton>
                    <Tooltip title={`Combat roll modifier for all ${role} units`}>
                        <Box
                            sx={{
                                borderRadius: 1,
                                backgroundColor: getBackgroundColor(currentValue),
                                p: "2px 4px",
                                width: "39px",
                                fontFamily: "Consolas",
                                textAlign: "center",
                            }}
                        >
                            {currentValueDisplay}
                        </Box>
                    </Tooltip>
                    <IconButton onClick={handleIncrement}>
                        <Add />
                    </IconButton>
                </ListItem>
            </>
        );
    }

    return (
        <>
            <ListItemButton onClick={handleIncrement} sx={{ mt: 2 }}>
                <Add />
            </ListItemButton>
            <ListItem
                sx={{
                    pl: 1,
                    pr: 1,
                }}
            >
                <Tooltip title={`Combat roll modifier for all ${role} units`} placement="right">
                    <Box
                        sx={{
                            borderRadius: 1,
                            backgroundColor: getBackgroundColor(currentValue),
                            p: "2px 4px",
                            width: "39px",
                            fontFamily: "Consolas",
                            textAlign: "center",
                        }}
                    >
                        {currentValueDisplay}
                    </Box>
                </Tooltip>
            </ListItem>
            <ListItemButton onClick={handleDecrement}>
                <Remove />
            </ListItemButton>
        </>
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
