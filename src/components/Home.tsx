import { Grid } from "@mui/material";
import React from "react";

import { ParticipantRole } from "model/common";
import { CalculationTrigger } from "./CalculationTrigger";
import { ParticipantUnitEditor } from "./ParticipantUnitEditor";
import { ResultView } from "./ResultView";

export function Home() {
    return (
        <div>
            <CalculationTrigger />
            <Grid container>
                <Grid item>
                    <ParticipantUnitEditor role={ParticipantRole.Attacker} />
                </Grid>
                <Grid item>
                    <ParticipantUnitEditor role={ParticipantRole.Defender} />
                </Grid>
            </Grid>
            <Grid container>
                <Grid item>
                    <ResultView />
                </Grid>
            </Grid>
        </div>
    );
}
