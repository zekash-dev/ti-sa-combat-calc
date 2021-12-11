import { Box, Grid, Typography } from "@mui/material";
import React from "react";

import { ParticipantRole } from "model/calculation";
import { CalculationTrigger } from "./CalculationTrigger";
import { ParticipantTagEditor } from "./ParticipantTagEditor";
import { ParticipantUnitEditor } from "./ParticipantUnitEditor";
import { ResultView } from "./ResultView";
import { ParticipantsDivider } from "./ParticipantsDivider";
import { ParticipantBattlefieldRepresentation } from "./ParticipantBattlefieldRepresentation";

export function Home() {
    return (
        <div>
            <CalculationTrigger />
            <ParticipantTagEditor location="left" role={ParticipantRole.Attacker} />
            <ParticipantTagEditor location="right" role={ParticipantRole.Defender} />
            <div style={{ margin: "0 72px" }}>
                <Box sx={{ position: "relative" }}>
                    <Grid container>
                        <Grid item xs={6} sx={{ textAlign: "center" }}>
                            <Typography variant="h3">{ParticipantRole.Attacker}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: "center" }}>
                            <Typography variant="h3">{ParticipantRole.Defender}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="center">
                        <Grid item xs={3}>
                            <ParticipantUnitEditor role={ParticipantRole.Attacker} />
                        </Grid>
                        <Grid item xs={3}>
                            <ParticipantBattlefieldRepresentation role={ParticipantRole.Attacker} />
                        </Grid>
                        <Grid item xs={3}>
                            <ParticipantBattlefieldRepresentation role={ParticipantRole.Defender} />
                        </Grid>
                        <Grid item xs={3}>
                            <ParticipantUnitEditor role={ParticipantRole.Defender} />
                        </Grid>
                    </Grid>
                    <ParticipantsDivider />
                </Box>
                <Grid container>
                    <Grid item xs={12}>
                        <ResultView />
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
