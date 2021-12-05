import { Grid } from "@mui/material";
import React from "react";

import { ParticipantRole } from "model/calculation";
import { CalculationTrigger } from "./CalculationTrigger";
import { OptionsManager } from "./OptionsManager";
import { ParticipantTagEditor } from "./ParticipantTagEditor";
import { ParticipantUnitEditor } from "./ParticipantUnitEditor";
import { ResultView } from "./ResultView";

export function Home() {
    return (
        <div>
            <CalculationTrigger />
            <ParticipantTagEditor location="left" role={ParticipantRole.Attacker} />
            <ParticipantTagEditor location="right" role={ParticipantRole.Defender} />
            <div style={{ margin: "0 72px" }}>
                <Grid container justifyContent="center">
                    <Grid item>
                        <ParticipantUnitEditor role={ParticipantRole.Attacker} />
                    </Grid>
                    <Grid item>
                        <ParticipantUnitEditor role={ParticipantRole.Defender} />
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <Grid item>
                        <OptionsManager />
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item>
                        <ResultView />
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
