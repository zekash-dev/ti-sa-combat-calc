import { CircularProgress, List, ListItem } from "@mui/material";
import { round } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

import { calculateAverageHits } from "logic/calculator";
import { Outcome } from "model/common";
import { selectCalculating, selectOutcomes } from "redux/result/resultSlice";

export function ResultView() {
    const outcomes: Outcome[] = useSelector(selectOutcomes);
    const calculating: boolean = useSelector(selectCalculating);

    return (
        <List>
            {outcomes.map((outcome, i) => (
                <>
                    <ListItem key={i}>
                        {round(outcome.probability * 100, 2)}%: {outcome.victor}
                    </ListItem>
                    <ListItem key={i + "-hits"}>
                        Hits:&nbsp;
                        {outcome.hits.map((p, i) => (
                            <span>
                                {i}: {round(p * 100, 2)}%&nbsp;&nbsp;
                            </span>
                        ))}
                    </ListItem>
                    <ListItem key={i + "-avg-hits"}>Average hits: {calculateAverageHits(outcome.hits)}</ListItem>
                </>
            ))}
            {calculating && <CircularProgress />}
        </List>
    );
}
