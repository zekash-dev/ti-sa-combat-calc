import { styled, Typography } from "@mui/material";

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
