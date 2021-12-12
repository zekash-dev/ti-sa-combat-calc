import { Typography } from "@mui/material";
import { round, sum } from "lodash";

import { CombatVictor, ParticipantRole } from "model/calculation";
import { KeyedDictionary } from "model/common";

interface ResultPercentageLabelsProps {
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
}

export function ResultPercentageLabels({ victorProbabilities }: ResultPercentageLabelsProps) {
    const attacker: number = victorProbabilities[ParticipantRole.Attacker] * 100;
    const defender: number = victorProbabilities[ParticipantRole.Defender] * 100;
    const draw: number = victorProbabilities["draw"] * 100;
    const undetermined: number = (1.0 - sum(Object.values(victorProbabilities))) * 100;
    const showDraw = draw > 0.1;
    const showUndetermined = undetermined > 0.1;
    return (
        <div style={{ width: "100%", height: "40px", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    left: `max(10px, calc(${attacker / 2}% - 100px))`,
                    whiteSpace: "nowrap",
                    transition: "left 0.5s",
                }}
            >
                <Typography variant="h5">Attacker: {formatPercent(attacker)}</Typography>
            </div>
            {showDraw && (
                <div
                    style={{
                        position: "absolute",
                        left: `clamp(280px, calc(${attacker + draw / 2}% - 20px), calc(100% - ${showUndetermined ? 750 : 550}px))`,
                        whiteSpace: "nowrap",
                        transition: "left 0.5s",
                    }}
                >
                    <Typography variant="h5">Draw: {formatPercent(draw)}</Typography>
                </div>
            )}
            {showUndetermined && (
                <div
                    style={{
                        position: "absolute",
                        right: `clamp(250px, calc(${defender + undetermined / 2}% - 80px), calc(100% - ${showDraw ? 750 : 550}px))`,
                        whiteSpace: "nowrap",
                        transition: "right 0.5s",
                    }}
                >
                    <Typography variant="h5">Undetermined: {formatPercent(undetermined)}</Typography>
                </div>
            )}
            <div
                style={{
                    position: "absolute",
                    right: `max(10px, calc(${defender / 2}% - 100px))`,
                    whiteSpace: "nowrap",
                    transition: "right 0.5s",
                }}
            >
                <Typography variant="h5">Defender: {formatPercent(defender)}</Typography>
            </div>
        </div>
    );
}

function formatPercent(value: number): string {
    const rounded: number = value > 10 ? round(value) : round(value, 1);
    return `${rounded}%`;
}
