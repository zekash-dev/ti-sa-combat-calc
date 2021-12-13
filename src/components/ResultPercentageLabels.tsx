import { Typography } from "@mui/material";
import { round, sum } from "lodash";

import { CombatVictor, ParticipantRole } from "model/calculation";
import { KeyedDictionary } from "model/common";

interface ResultPercentageLabelsProps {
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
    small?: boolean;
}

export function ResultPercentageLabels({ victorProbabilities, small }: ResultPercentageLabelsProps) {
    const attacker: number = victorProbabilities[ParticipantRole.Attacker] * 100;
    const defender: number = victorProbabilities[ParticipantRole.Defender] * 100;
    const draw: number = victorProbabilities["draw"] * 100;
    const undetermined: number = (1.0 - sum(Object.values(victorProbabilities))) * 100;
    const showDraw = draw > 0.1;
    const showUndetermined = undetermined > 0.1;
    return (
        <div style={{ width: "100%", height: small ? "20px" : "24px", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    left: `max(10px, calc(${attacker / 2}% - 100px))`,
                    whiteSpace: "nowrap",
                    transition: "left 0.5s",
                }}
            >
                <PercentageLabel label="Attacker" percentage={attacker} small={small} />
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
                    <PercentageLabel label="Draw" percentage={draw} small={small} />
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
                    <PercentageLabel label="Undetermined" percentage={undetermined} small={small} />
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
                <PercentageLabel label="Defender" percentage={defender} small={small} />
            </div>
        </div>
    );
}

interface PercentageLabelProps {
    label: string;
    percentage: number;
    small?: boolean;
}

function PercentageLabel({ label, percentage, small }: PercentageLabelProps) {
    return (
        <Typography variant="body1" color="text.secondary" style={{ fontSize: small ? "0.9em" : undefined }}>
            {label}: {formatPercent(percentage)}
        </Typography>
    );
}

function formatPercent(value: number): string {
    const rounded: number = value > 10 ? round(value) : round(value, 1);
    return `${rounded}%`;
}
