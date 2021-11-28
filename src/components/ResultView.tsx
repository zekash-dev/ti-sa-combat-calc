import { List, ListItem, Typography } from "@mui/material";
import { round } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

import { AggregatedCombatResult } from "model/common";
import { selectAggregateResults } from "redux/result/resultSlice";

export function ResultView() {
    const results: AggregatedCombatResult[] = useSelector(selectAggregateResults);

    return (
        <List>
            {results.map((outcome, i) => (
                <>
                    <ListItem key={i}>
                        <Typography>
                            {round(outcome.probability * 100, 1)}%: {outcome.victor}
                        </Typography>
                    </ListItem>
                    {/* <ListItem key={i + "-hits"}>
                        Avg. attacker hits: {outcome.avgAttackerHits}; Avg. defender hits: {outcome.avgDefenderHits};
                    </ListItem> */}
                </>
            ))}
        </List>
    );
}
