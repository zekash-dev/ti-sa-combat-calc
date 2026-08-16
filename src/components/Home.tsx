import { Box, Stack, Typography } from "@mui/material";
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
import { ParticipantHitAssignmentStrategyInput } from "./units/ParticipantHitAssignmentStrategyInput";

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
                    <Stack direction="row">
                        <Box sx={{ width: 290 }}>
                            <Typography variant="h4" color="textPrimary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Attacker}
                            </Typography>
                        </Box>
                        <Box sx={{ width: "calc(100% - 580px)" }}>
                            <HeaderMenu />
                        </Box>
                        <Box sx={{ width: 290 }}>
                            <Typography variant="h4" color="textPrimary" sx={{ textAlign: "center" }}>
                                {ParticipantRole.Defender}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" sx={{ position: "relative" }}>
                        <Box sx={{ width: 290 }}>
                            <ParticipantUnitEditor role={ParticipantRole.Attacker} />
                        </Box>
                        <Box sx={{ width: "calc(50% - 290px)", position: "relative" }}>
                            <ParticipantBattlefieldRepresentation
                                role={ParticipantRole.Attacker}
                                participant={richParticipants[ParticipantRole.Attacker]}
                            />
                            <Box sx={{ right: 0, bottom: 0, position: "absolute" }}>
                                <ParticipantHitAssignmentStrategyInput
                                    role={ParticipantRole.Attacker}
                                    participant={richParticipants[ParticipantRole.Attacker]}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ width: "calc(50% - 290px)", position: "relative" }}>
                            <ParticipantBattlefieldRepresentation
                                role={ParticipantRole.Defender}
                                participant={richParticipants[ParticipantRole.Defender]}
                            />
                            <Box sx={{ left: 0, bottom: 0, position: "absolute" }}>
                                <ParticipantHitAssignmentStrategyInput
                                    role={ParticipantRole.Defender}
                                    participant={richParticipants[ParticipantRole.Defender]}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ width: 290 }}>
                            <ParticipantUnitEditor role={ParticipantRole.Defender} />
                        </Box>
                        <ParticipantsDivider />
                    </Stack>
                </Box>
                <Box>
                    <ResultView />
                </Box>
            </div>
        </div>
    );
}
