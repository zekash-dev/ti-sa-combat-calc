import { List, ListItem, Typography } from "@mui/material";
import { round } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

import { CalculationOutput, CombatVictor } from "model/common";
import { selectOutput } from "redux/result/resultSlice";

export function ResultView() {
    const output: CalculationOutput | null = useSelector(selectOutput);

    if (!output) return null;
    return (
        <List>
            {Object.keys(output.victorProbabilites).map((victor, i) => (
                <ListItem key={victor}>
                    <Typography>
                        {round(output.victorProbabilites[victor as CombatVictor] * 100, 1)}%: {victor}
                    </Typography>
                </ListItem>
            ))}
        </List>
    );
}
