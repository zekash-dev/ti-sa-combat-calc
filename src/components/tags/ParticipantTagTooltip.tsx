import { Box, Tooltip, Typography } from "@mui/material";
import { ParticipantTagResources } from "model/combatTags";
import React from "react";

interface TooltipContentProps {
    tag: ParticipantTagResources;
    children: React.ReactElement;
    placement?:
        | "bottom-end"
        | "bottom-start"
        | "bottom"
        | "left-end"
        | "left-start"
        | "left"
        | "right-end"
        | "right-start"
        | "right"
        | "top-end"
        | "top-start"
        | "top";
}

export function ParticipantTagTooltip({ tag, children, placement }: TooltipContentProps) {
    const descriptionLines = Array.isArray(tag.description) ? tag.description : [tag.description];
    const tooltipContent = (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {tag.name}
            </Typography>
            {descriptionLines.map((line, i) => (
                <Typography key={`line-${i}`} variant="body2" sx={{ mb: 1 }}>
                    {line}
                </Typography>
            ))}
        </Box>
    );

    return (
        <Tooltip title={tooltipContent} placement={placement} disableInteractive>
            {children}
        </Tooltip>
    );
}
