import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    CalculationInput,
    CalculationInputSettings,
    CalculationOutput,
    CombatStage,
    ParticipantInput,
    ParticipantRole,
    TrackedValues,
} from "model/calculation";
import { KeyedDictionary } from "model/common";
import { selectShowStatisticsForStage, setShowStatisticsForStage } from "redux/options/optionsSlice";
import { selectCalculationInput, selectParticipants } from "redux/participant/participantSlice";
import { selectOutput } from "redux/result/resultSlice";
import { CasualtiesView } from "./CasualtiesView";
import { CombatStageResultView } from "./CombatStageResultView";
import { ResultPercentageBars } from "./ResultPercentageBars";
import { ResultPercentageLabels } from "./ResultPercentageLabels";
import { AppDispatch } from "redux/store";

export function ResultView() {
    const dispatch = useDispatch<AppDispatch>();
    const [expanded, setExpanded] = useState(true);
    const input: CalculationInput = useSelector(selectCalculationInput);
    const output: CalculationOutput | null = useSelector(selectOutput);
    const participants: KeyedDictionary<ParticipantRole, ParticipantInput> = useSelector(selectParticipants);
    const showStatistics = useSelector(selectShowStatisticsForStage(CombatStage.RoundN));

    const toggleShowStatistics = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const nextValue: boolean = !showStatistics;
        dispatch(setShowStatisticsForStage(CombatStage.RoundN, nextValue));
        if (nextValue && !expanded) {
            setExpanded(true);
        }
    };

    if (!output) {
        return (
            <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ minWidth: "400px" }}>
                        Add units to start calculating outcomes...
                    </Typography>
                </AccordionSummary>
            </Accordion>
        );
    }

    return (
        <>
            <CombatStageResultView input={input} output={output} participants={participants} />
            <Accordion expanded={expanded} disableGutters onChange={() => setExpanded((prev) => !prev)}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" color="textPrimary" sx={{ minWidth: "400px" }}>
                        Final results
                    </Typography>
                    <TrackedValuesDisplay settings={output.settings} trackedValues={output.trackedValues} />
                    <Button sx={{ marginLeft: "auto" }} variant="text" onClick={toggleShowStatistics}>
                        {showStatistics ? "Hide statistics" : "Show statistics"}
                    </Button>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                    <ResultPercentageLabels victorProbabilities={output.victorProbabilities} />
                    <ResultPercentageBars victorProbabilities={output.victorProbabilities} participants={participants} />
                    {showStatistics && <CasualtiesView input={input} statistics={output.statistics} participants={participants} />}
                </AccordionDetails>
            </Accordion>
        </>
    );
}

interface TrackedValuesDisplayProps {
    settings: CalculationInputSettings;
    trackedValues: TrackedValues;
}

function TrackedValuesDisplay({ settings, trackedValues }: TrackedValuesDisplayProps) {
    if (settings.simplificationTarget === undefined) return null;
    if (trackedValues.maxPotentialBranches === undefined) return null;

    let simplificationText: string = `Simplification: ${trackedValues.maxPotentialBranches} ➔ ${settings.simplificationTarget} branches`;
    if (trackedValues.maxPotentialBranches <= settings.simplificationTarget) {
        simplificationText += " (no simplification required)";
    }

    return <Typography sx={{ color: "text.secondary" }}>{simplificationText}</Typography>;
}
