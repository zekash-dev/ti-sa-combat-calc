import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

import { ParticipantRole, RichParticipantsInput } from "model/calculation";
import { selectRichParticipantsInput } from "redux/participant/participantSlice";
import { CalculationTrigger } from "./CalculationTrigger";
import { ParticipantBattlefieldRepresentation } from "./ParticipantBattlefieldRepresentation";
import { ParticipantsDivider } from "./ParticipantsDivider";
import { ParticipantTagEditor } from "./ParticipantTagEditor";
import { ParticipantUnitEditor } from "./ParticipantUnitEditor";
import { ResultView } from "./ResultView";

export function Home() {
    const richParticipants: RichParticipantsInput = useSelector(selectRichParticipantsInput);

    return (
        <div>
            <CalculationTrigger />
            <ParticipantTagEditor location="left" role={ParticipantRole.Attacker} />
            <ParticipantTagEditor location="right" role={ParticipantRole.Defender} />
            <div style={{ margin: "0 72px" }}>
                <Box sx={{ position: "relative" }}>
                    <Grid container>
                        <Grid item sx={{ width: 290 }}>
                            <Typography variant="h4" color="text.primary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Attacker}
                            </Typography>
                            <ParticipantUnitEditor role={ParticipantRole.Attacker} />
                        </Grid>
                        <Grid item sx={{ width: "calc(50% - 290px)" }}>
                            <ParticipantBattlefieldRepresentation
                                role={ParticipantRole.Attacker}
                                participant={richParticipants[ParticipantRole.Attacker]}
                            />
                        </Grid>
                        <Grid item sx={{ width: "calc(50% - 290px)" }}>
                            <ParticipantBattlefieldRepresentation
                                role={ParticipantRole.Defender}
                                participant={richParticipants[ParticipantRole.Defender]}
                            />
                        </Grid>
                        <Grid item sx={{ width: 290 }}>
                            <Typography variant="h4" color="text.primary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Defender}
                            </Typography>
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
