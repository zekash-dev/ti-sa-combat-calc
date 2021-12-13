import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Tooltip, Typography } from "@mui/material";
import { round } from "lodash";
import { useState } from "react";

import { combatStageResources } from "logic/participant";
import {
    CalculationOutput,
    CombatStage,
    CombatStageOutput,
    CombatStageParticipantStatistics,
    ParticipantInput,
    ParticipantRole,
} from "model/calculation";
import { KeyedDictionary } from "model/common";
import { ResultPercentageBars } from "./ResultPercentageBars";
import { ResultPercentageLabels } from "./ResultPercentageLabels";

interface CombatStageResultViewProps {
    output: CalculationOutput;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export function CombatStageResultView({ output, participants }: CombatStageResultViewProps) {
    return (
        <>
            <CombatStageView output={output} participants={participants} stage={CombatStage.SpaceMines} />
            <CombatStageView output={output} participants={participants} stage={CombatStage.PDS} />
            <CombatStageView output={output} participants={participants} stage={CombatStage.StartOfBattle} />
            <CombatStageView output={output} participants={participants} stage={CombatStage.AntiFighterBarrage} />
            <CombatStageView output={output} participants={participants} stage={CombatStage.PreCombat} />
            <CombatStageView output={output} participants={participants} stage={CombatStage.Round1} />
        </>
    );
}

interface CombatStageViewProps {
    output: CalculationOutput;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
    stage: CombatStage;
}

function CombatStageView(props: CombatStageViewProps) {
    const [expanded, setExpanded] = useState(false);
    const { output, participants, stage } = props;
    const stageOutput: CombatStageOutput | undefined = output.stages[stage];
    if (!stageOutput) return null;
    return (
        <Accordion expanded={expanded} disableGutters onChange={() => setExpanded((prev) => !prev)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h5" color="text.primary" sx={{ minWidth: "400px" }}>
                    {combatStageResources[stage].name}
                </Typography>
                <ParticipantHitsDisplay label="Attacker" participant={stageOutput.statistics.attacker} />
                <ParticipantHitsDisplay label="Defender" participant={stageOutput.statistics.defender} />
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
                <ResultPercentageLabels victorProbabilities={stageOutput.victorProbabilities} small />
                <ResultPercentageBars victorProbabilities={stageOutput.victorProbabilities} participants={participants} small />
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
