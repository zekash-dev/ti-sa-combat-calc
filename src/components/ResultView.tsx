import { CircularProgress, List, ListItem } from "@mui/material";
import { round } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

import { Outcome } from "model/common";
import { selectCalculating, selectOutcomes } from "redux/result/resultSlice";

export function ResultView() {
    const outcomes: Outcome[] = useSelector(selectOutcomes);
    const calculating: boolean = useSelector(selectCalculating);

    return (
        <List>
            {outcomes.map((outcome, i) => (
                <ListItem key={i}>
                    {round(outcome.propability * 100, 2)}%: {outcome.victor}
                </ListItem>
            ))}
            {calculating && <CircularProgress />}
        </List>
    );
}
