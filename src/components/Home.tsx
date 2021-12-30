import { Box, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

import { ParticipantRole, RichParticipantsInput } from "model/calculation";
import { selectRichParticipantsInput } from "redux/participant/participantSlice";
import { CalculationTrigger } from "./CalculationTrigger";
import { HeaderMenu } from "./menu/HeaderMenu";
import { ParticipantsDivider } from "./ParticipantsDivider";
import { ResultView } from "./results/ResultView";
import { ParticipantTagEditor } from "./tags/ParticipantTagEditor";
import { ParticipantBattlefieldRepresentation } from "./units/ParticipantBattlefieldRepresentation";
import { ParticipantUnitEditor } from "./units/ParticipantUnitEditor";
import { UrlParamsTrigger } from "./UrlParamsTrigger";

export function Home() {
    const [attackerOpen, setAttackerOpen] = useState<boolean>(false);
    const [defenderOpen, setDefenderOpen] = useState<boolean>(false);
    const richParticipants: RichParticipantsInput = useSelector(selectRichParticipantsInput);

    return (
        <div>
            <CalculationTrigger />
            <UrlParamsTrigger />
            <ParticipantTagEditor location="left" role={ParticipantRole.Attacker} open={attackerOpen} onOpenChange={setAttackerOpen} />
            <ParticipantTagEditor location="right" role={ParticipantRole.Defender} open={defenderOpen} onOpenChange={setDefenderOpen} />
            <div style={{ margin: "0 56px" }}>
                <Box sx={{ position: "relative" }}>
                    <Grid container>
                        <Grid item sx={{ width: 290 }}>
                            <Typography variant="h4" color="text.primary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Attacker}
                            </Typography>
                        </Grid>
                        <Grid item sx={{ width: "calc(100% - 580px)" }}>
                            <HeaderMenu />
                        </Grid>
                        <Grid item sx={{ width: 290 }}>
                            <Typography variant="h4" color="text.primary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Defender}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container sx={{ position: "relative" }}>
                        <Grid item sx={{ width: 290 }}>
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
                            <ParticipantUnitEditor role={ParticipantRole.Defender} />
                        </Grid>
                        <ParticipantsDivider />
                    </Grid>
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
