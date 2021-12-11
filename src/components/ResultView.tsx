import { styled, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { round } from "lodash";
import { useSelector } from "react-redux";

import { factionResources } from "logic/participant";
import { CalculationOutput, ParticipantInput, ParticipantRole } from "model/calculation";
import { FactionResources } from "model/combatTags";
import { KeyedDictionary } from "model/common";
import { selectparticipants } from "redux/participant/participantSlice";
import { selectOutput } from "redux/result/resultSlice";

export function ResultView() {
    const output: CalculationOutput | null = useSelector(selectOutput);
    const participants: KeyedDictionary<ParticipantRole, ParticipantInput> = useSelector(selectparticipants);

    if (!output) return null;

    return (
        <>
            <ResultVictorLabels output={output} />
            <ResultVictorBars output={output} participants={participants} />
        </>
    );
}

interface ResultVictorLabelsProps {
    output: CalculationOutput;
}

function ResultVictorLabels({ output }: ResultVictorLabelsProps) {
    const attackerPercent: number = output.victorProbabilites[ParticipantRole.Attacker] * 100;
    const defenderPercent: number = output.victorProbabilites[ParticipantRole.Defender] * 100;
    const drawPercent: number = output.victorProbabilites["draw"] * 100;
    return (
        <div style={{ width: "100%", height: "40px", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    left: `max(10px, calc(${attackerPercent / 2}% - 100px))`,
                    whiteSpace: "nowrap",
                }}
            >
                <Typography variant="h5">Attacker: {round(attackerPercent)}%</Typography>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: `clamp(250px, calc(${attackerPercent + drawPercent / 2}% - 10px), calc(100% - 450px))`,
                    whiteSpace: "nowrap",
                }}
            >
                <Typography variant="h5">Draw: {round(drawPercent)}%</Typography>
            </div>
            <div
                style={{
                    position: "absolute",
                    right: `max(10px, calc(${defenderPercent / 2}% - 100px))`,
                    whiteSpace: "nowrap",
                }}
            >
                <Typography variant="h5">Defender: {round(defenderPercent)}%</Typography>
            </div>
        </div>
    );
}

interface ResultVictorBarsProps {
    output: CalculationOutput;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

function ResultVictorBars({ output, participants }: ResultVictorBarsProps) {
    const attackerPercent: number = output.victorProbabilites[ParticipantRole.Attacker] * 100;
    const defenderPercent: number = output.victorProbabilites[ParticipantRole.Defender] * 100;
    const drawPercent: number = output.victorProbabilites["draw"] * 100;

    const attackerResources: FactionResources = factionResources[participants.attacker.faction];
    const defenderResources: FactionResources = factionResources[participants.defender.faction];
    let bars: JSX.Element[];
    if (attackerPercent > 1 && defenderPercent > 1) {
        bars = [
            <SlantedResultVictorBar key="att" sx={{ width: attackerPercent + "%", backgroundColor: attackerResources.color }} />,
            <SlantedResultVictorBar key="drw" sx={{ width: drawPercent + "%", backgroundColor: grey[900] }} />,
            <SlantedResultVictorBar key="dfn" sx={{ width: defenderPercent + "%", backgroundColor: defenderResources.color }} />,
        ];
    } else {
        bars = [
            <StandardResultVictorBar key="att" sx={{ width: attackerPercent + "%", backgroundColor: attackerResources.color }} />,
            <StandardResultVictorBar key="drw" sx={{ width: drawPercent + "%", backgroundColor: grey[900] }} />,
            <StandardResultVictorBar key="dfn" sx={{ width: defenderPercent + "%", backgroundColor: defenderResources.color }} />,
        ];
    }

    return <div style={{ display: "flex" }}>{bars}</div>;
}

const StandardResultVictorBar = styled("div")(({ theme }) => ({
    height: 120,
    display: "inline-block",
    position: "relative",
}));

const SlantedResultVictorBar = styled("div")(({ theme }) => ({
    height: 120,
    display: "inline-block",
    position: "relative",
    "&:after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 30,
        width: "100%",
        height: "100%",
        background: "inherit",
        transformOrigin: "0% 0",
        transform: "skewX(-22.5deg)",
        zIndex: 1,
    },
}));
