import { styled, Typography } from "@mui/material";
import React from "react";

export const ImageLink = styled("img")({
    width: 40,
    opacity: 0.1,
    transition: "opacity 0.2s",
    ":hover": {
        opacity: 1.0,
    },
});

export const Paragraph = styled(Typography)({
    marginTop: 5,
});

interface SubheaderProps {
    first?: boolean;
    children: React.ReactNode;
}

export function Subheading({ first, children }: SubheaderProps) {
    return (
        <Typography variant="body1" color="text.primary" sx={{ marginTop: first ? 0 : 3, fontSize: "1.5em" }}>
            {children}
        </Typography>
    );
}
