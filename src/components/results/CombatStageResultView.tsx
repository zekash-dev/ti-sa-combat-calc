import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Button, Tooltip, Typography } from "@mui/material";
import { round } from "lodash";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { combatStageResources } from "logic/participant";
import {
    CalculationInput,
    CalculationOutput,
    CombatStage,
    CombatStageOutput,
    CombatStageParticipantStatistics,
    ParticipantInput,
    ParticipantRole,
} from "model/calculation";
import { KeyedDictionary } from "model/common";
import { selectShowStatisticsForStage, setShowStatisticsForStage } from "redux/options/optionsSlice";
import { CasualtiesView } from "./CasualtiesView";
import { ResultPercentageBars } from "./ResultPercentageBars";
import { ResultPercentageLabels } from "./ResultPercentageLabels";

interface CombatStageResultViewProps {
    input: CalculationInput;
    output: CalculationOutput;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export function CombatStageResultView({ input, output, participants }: CombatStageResultViewProps) {
    return (
        <>
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.SpaceMines} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.Bombardment} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.SpaceCannon} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.InvasionDefence} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.StartOfBattle} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.AntiFighterBarrage} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.PreCombat} />
            <CombatStageView input={input} output={output} participants={participants} stage={CombatStage.Round1} />
        </>
    );
}

interface CombatStageViewProps {
    input: CalculationInput;
    output: CalculationOutput;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
    stage: CombatStage;
}

function CombatStageView({ input, output, participants, stage }: CombatStageViewProps) {
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState(false);
    const showStatistics = useSelector(selectShowStatisticsForStage(stage));

    const toggleShowStatistics = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const nextValue: boolean = !showStatistics;
        dispatch(setShowStatisticsForStage(stage, nextValue));
        if (nextValue && !expanded) {
            setExpanded(true);
        }
    };
    const stageOutput: CombatStageOutput | undefined = output.stages[stage];
    if (!stageOutput) return null;
    return (
        <Accordion expanded={expanded} disableGutters onChange={() => setExpanded((prev) => !prev)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" color="text.primary" sx={{ minWidth: "400px" }}>
                    {combatStageResources[stage].name}
                </Typography>
                <ParticipantHitsDisplay label="Attacker" participant={stageOutput.statistics.attacker} />
                <ParticipantHitsDisplay label="Defender" participant={stageOutput.statistics.defender} />
                <Button sx={{ marginLeft: "auto" }} variant="text" onClick={toggleShowStatistics}>
                    {showStatistics ? "Hide statistics" : "Show statistics"}
                </Button>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
                <ResultPercentageLabels victorProbabilities={stageOutput.victorProbabilities} small />
                <ResultPercentageBars victorProbabilities={stageOutput.victorProbabilities} participants={participants} small />
                {showStatistics && <CasualtiesView input={input} statistics={stageOutput.statistics} participants={participants} />}
            </AccordionDetails>
        </Accordion>
    );
}
interface ParticipantHitsDisplayProps {
    label: string;
    participant: CombatStageParticipantStatistics;
}

function ParticipantHitsDisplay({ label, participant }: ParticipantHitsDisplayProps) {
    let precision: number = 1;
    if (
        participant.expectedHits < 1 ||
        participant.assignedHits < 1 ||
        (round(participant.expectedHits, 1) === round(participant.assignedHits, 1) &&
            round(participant.expectedHits, 2) !== round(participant.assignedHits, 2))
    ) {
        precision = 2;
    }
    let expected: number = round(participant.expectedHits, precision);
    let assigned: number = round(participant.assignedHits, precision);
    let expectedEqualsAssigned: boolean = expected === assigned;

    return (
        <Typography sx={{ width: "200px", color: "text.secondary" }}>
            {label} hits:{" "}
            {expectedEqualsAssigned ? (
                <span>{expected}</span>
            ) : (
                <>
                    <Tooltip title="Expected hits">
                        <span>{expected}</span>
                    </Tooltip>
                    {" ➔ "}
                    <Tooltip title="Assigned hits">
                        <span>{assigned}</span>
                    </Tooltip>
                </>
            )}
        </Typography>
    );
}
