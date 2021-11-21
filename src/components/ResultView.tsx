import { CircularProgress, List, ListItem } from "@mui/material";
import { round } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

import { AggregatedOutcome } from "model/common";
import { selectAggregateOutcomes, selectCalculating } from "redux/result/resultSlice";

export function ResultView() {
    const outcomes: AggregatedOutcome[] = useSelector(selectAggregateOutcomes);
    const calculating: boolean = useSelector(selectCalculating);

    return (
        <List>
            {outcomes.map((outcome, i) => (
                <>
                    <ListItem key={i}>
                        {round(outcome.probability * 100, 2)}%: {outcome.victor ?? "DRAW"} (round {outcome.combatRounds})
                    </ListItem>
                    <ListItem key={i + "-hits"}>
                        Avg. attacker hits: {outcome.avgAttackerHits}; Avg. defender hits: {outcome.avgDefenderHits};
                    </ListItem>
                </>
            ))}
            {calculating && <CircularProgress />}
        </List>
    );
}
