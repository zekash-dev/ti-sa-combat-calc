import { Table } from "@mui/material";
import React from "react";

export function UnstyledSmallTable({ children }: { children: React.ReactNode }) {
    return (
        <Table
            size="small"
            sx={{
                "& td": {
                    padding: "unset",
                    border: "none",
                    justifyContent: "center",
                },
            }}
        >
            {children}
        </Table>
    );
}
