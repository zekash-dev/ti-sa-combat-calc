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

    const attackerWidth: number = small ? 110 : 130;
    const defenderWidth: number = small ? 120 : 140;
    const drawWidth: number = showDraw ? (small ? 95 : 110) : 0;
    const undeterminedWidth: number = showUndetermined ? (small ? 150 : 170) : 0;

    return (
        <div style={{ width: "calc(100% - 20px)", height: small ? "24px" : "28px", position: "relative", marginLeft: 10 }}>
            <div
                style={{
                    position: "absolute",
                    width: attackerWidth,
                    left: `max(0px, calc(${attacker / 2}% - ${attackerWidth / 2}px))`,
                    textAlign: "center",
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
                        width: drawWidth,
                        left: `clamp(${attackerWidth}px, calc(${attacker + draw / 2}% - ${drawWidth / 2}px), min(calc(${
                            showUndetermined
                                ? `${100 - defender - undetermined / 2}% - ${drawWidth + undeterminedWidth / 2}px`
                                : `${100 - defender / 2}% - ${drawWidth + defenderWidth / 2}px`
                        }), calc(100% - ${defenderWidth + undeterminedWidth + drawWidth}px)))`,
                        textAlign: "center",
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
                        width: undeterminedWidth,
                        right: `clamp(${defenderWidth}px, calc(${defender + undetermined / 2}% - ${undeterminedWidth / 2}px), min(calc(${
                            showDraw
                                ? `${100 - attacker - draw / 2}% - ${undeterminedWidth + drawWidth / 2}px`
                                : `${100 - attacker / 2}% - ${undeterminedWidth + attackerWidth / 2}px`
                        }), calc(100% - ${attackerWidth + undeterminedWidth + drawWidth}px)))`,
                        textAlign: "center",
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
                    width: defenderWidth,
                    right: `max(0px, calc(${defender / 2}% - ${defenderWidth / 2}px))`,
                    textAlign: "center",
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
        <Typography variant="body1" color="text.primary" style={{ fontSize: small ? "1em" : "1.1em" }}>
            {label}: {formatPercent(percentage)}
        </Typography>
    );
}

function formatPercent(value: number): string {
    const rounded: number = value > 10 ? round(value) : round(value, 1);
    return `${rounded}%`;
}
