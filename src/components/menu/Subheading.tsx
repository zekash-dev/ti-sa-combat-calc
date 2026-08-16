import { Typography } from "@mui/material";
import React from "react";

interface Props {
    first?: boolean;
    children: React.ReactNode;
}

export function Subheading({ first, children }: Props) {
    return (
        <Typography variant="body1" color="textPrimary" sx={{ marginTop: first ? 0 : 3, fontSize: "1.5em" }}>
            {children}
        </Typography>
    );
}
