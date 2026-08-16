import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { ParticipantRole, RichParticipant } from "model/calculation";
import { CommonParticipantTag, HitAssignmentStrategy } from "model/combatTags";
import { setParticipantTag } from "redux/participant/participantSlice";
import { Bolt, Shield } from "@mui/icons-material";
import { toDarkerHue } from "logic/styling";
import { AppDispatch } from "redux/store";

interface Props {
    role: ParticipantRole;
    participant: RichParticipant;
}

export function ParticipantHitAssignmentStrategyInput({ role, participant }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const currentValue: HitAssignmentStrategy = participant.tags[CommonParticipantTag.HIT_ASSIGNMENT_STRATEGY];
    const left: boolean = role === ParticipantRole.Attacker;
    const right = !left;

    const buttonColor = currentValue === HitAssignmentStrategy.SustainFirst ? "#5c9eed" : "#ed6f61";
    const buttonText = currentValue === HitAssignmentStrategy.SustainFirst ? "Sustain first" : "Preserve power";

    const IconComponent = currentValue === HitAssignmentStrategy.SustainFirst ? Shield : Bolt;
    const iconColor = toDarkerHue(buttonColor, 0.6);
    const icon = <IconComponent sx={{ color: iconColor, margin: "0 5px" }} />;

    const tooltipText =
        currentValue === HitAssignmentStrategy.SustainFirst
            ? "Always sustain damage before destroying units."
            : "Preserve as much combat power as possible.";
    const tooltipContent = (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Hit assignment strategy
            </Typography>
            {tooltipText}
        </Box>
    );

    const handleClick = useCallback(() => {
        const newValue: HitAssignmentStrategy =
            currentValue === HitAssignmentStrategy.SustainFirst ? HitAssignmentStrategy.PreservePower : HitAssignmentStrategy.SustainFirst;
        dispatch(
            setParticipantTag({
                role: role,
                key: CommonParticipantTag.HIT_ASSIGNMENT_STRATEGY,
                value: newValue,
            }),
        );
    }, [dispatch, role, currentValue]);

    return (
        <Box>
            <Tooltip title={tooltipContent} placement="top" disableInteractive>
                <Button
                    variant="contained"
                    onClick={handleClick}
                    sx={{
                        backgroundColor: buttonColor,
                        border: "none",
                        borderRadius: 0,
                        "&:hover": {
                            bgcolor: toDarkerHue(buttonColor, 0.3),
                        },
                        ...(left && {
                            clipPath: "polygon(18px 0, 100% 0, 100% 100%, 0 100%)",
                            paddingLeft: "24px",
                            paddingRight: 0,
                        }),
                        ...(right && {
                            clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 100%, 0 100%)",
                            paddingLeft: 0,
                            paddingRight: "24px",
                        }),
                    }}
                >
                    {right && icon}
                    <Typography variant="body2" sx={{ width: "120px", whiteSpace: "nowrap" }}>
                        {buttonText}
                    </Typography>
                    {left && icon}
                </Button>
            </Tooltip>
        </Box>
    );
}
