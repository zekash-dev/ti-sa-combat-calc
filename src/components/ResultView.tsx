import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

import { CalculationOutput, ParticipantInput, ParticipantRole } from "model/calculation";
import { KeyedDictionary } from "model/common";
import { selectparticipants } from "redux/participant/participantSlice";
import { selectOutput } from "redux/result/resultSlice";
import { CombatStageResultView } from "./CombatStageResultView";
import { ResultPercentageBars } from "./ResultPercentageBars";
import { ResultPercentageLabels } from "./ResultPercentageLabels";

export function ResultView() {
    const [expanded, setExpanded] = useState(true);
    const output: CalculationOutput | null = useSelector(selectOutput);
    const participants: KeyedDictionary<ParticipantRole, ParticipantInput> = useSelector(selectparticipants);

    if (!output) return null;

    return (
        <>
            <CombatStageResultView output={output} participants={participants} />
            <Accordion expanded={expanded} disableGutters onChange={() => setExpanded((prev) => !prev)}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h5" color="text.primary">
                        Final results
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                    <ResultPercentageLabels victorProbabilities={output.victorProbabilities} />
                    <ResultPercentageBars victorProbabilities={output.victorProbabilities} participants={participants} />
                </AccordionDetails>
            </Accordion>
        </>
    );
}
