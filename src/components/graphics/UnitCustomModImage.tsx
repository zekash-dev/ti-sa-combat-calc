import { Edit } from "@mui/icons-material";
import { Box } from "@mui/material";
import React from "react";

interface Props {
    modType: "positive" | "negative";
}

export const UnitCustomModImage = React.memo(({ modType }: Props) => {
    return (
        <Box
            sx={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                mt: "3px",
                ml: "3px",
                p: "2px",
                borderRadius: "50%",
                backgroundColor: modType === "positive" ? "#31B32B" : "#F4641D",
            }}
        >
            <Edit fontSize="small" />
        </Box>
    );
});
