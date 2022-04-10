import { Grid } from "@mui/material";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    ChartType,
    Legend,
    LinearScale,
    Title,
    Tooltip,
    TooltipModel,
} from "chart.js";
import { capitalize, clamp, isEqual, max, repeat } from "lodash";
import { useState } from "react";
import { Bar } from "react-chartjs-2";

import { factionResources } from "logic/participant";
import { toDarkerHue } from "logic/styling";
import { CalculationInput, ParticipantInput, ParticipantRole, StatisticsBase, SurvivingUnitsStatistics } from "model/calculation";
import { KeyedDictionary } from "model/common";
import { CasualtiesViewTooltip, defaultTooltipContext, TooltipContext } from "./CasualtiesViewTooltip";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ChartJSTooltipContext<TType extends ChartType> = { chart: ChartJS; tooltip: TooltipModel<TType> };

interface CasualtiesViewProps {
    input: CalculationInput;
    statistics: KeyedDictionary<ParticipantRole, StatisticsBase>;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
}

export function CasualtiesView(props: CasualtiesViewProps) {
    return (
        <Grid container>
            <Grid item xs={6}>
                <CasualtiesParticipantView {...props} participant={ParticipantRole.Attacker} />
            </Grid>
            <Grid item xs={6}>
                <CasualtiesParticipantView {...props} participant={ParticipantRole.Defender} />
            </Grid>
        </Grid>
    );
}

interface CasualtiesParticipantViewProps extends CasualtiesViewProps {
    participant: ParticipantRole;
}

export function CasualtiesParticipantView(props: CasualtiesParticipantViewProps) {
    const { statistics, participants, participant } = props;
    const participantInput: ParticipantInput = participants[participant];
    const labels: string[] = [];
    const data: number[] = [];

    const [tooltipContext, setTooltipContext] = useState<TooltipContext>(defaultTooltipContext);

    const survivingUnitsStatistics: SurvivingUnitsStatistics[] = statistics[participant].survivingUnitProbabilities;
    for (let survivingUnits of survivingUnitsStatistics) {
        let percentage = survivingUnits.probability * 100;
        if (participant === ParticipantRole.Defender) {
            percentage *= -1;
        }

        let label: string = String(survivingUnits.units.length);
        if (survivingUnits.sustainedHits > 0) {
            label = `${label}${repeat("*", survivingUnits.sustainedHits)}`;
        }
        labels.push(label);
        data.push(percentage);
    }

    const options: ChartOptions<"bar"> = {
        maintainAspectRatio: false,
        indexAxis: "y" as const,
        elements: {
            bar: {
                base: 10,
            },
        },
        scales: {
            x: {
                position: "bottom",
                ticks: {
                    callback: function (val: string | number) {
                        let percentage = Number(val);
                        if (participant === ParticipantRole.Defender) {
                            percentage *= -1;
                        }
                        return `${percentage}%`;
                    },
                },
                min: participant === ParticipantRole.Attacker ? 0 : -100,
                max: participant === ParticipantRole.Attacker ? 100 : 0,
                title: {
                    display: true,
                    text: "Probability",
                },
            },
            y: {
                position: participant === ParticipantRole.Attacker ? "left" : "right",
                title: {
                    display: true,
                    text: "Number of units",
                },
            },
        },
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: "right" as const,
            },
            title: {
                display: true,
                text: "Surviving units",
            },
            tooltip: {
                enabled: false,
                external: function (context) {
                    const newContext: TooltipContext = createTooltipContext(context);
                    if (!isEqual(tooltipContext, newContext)) {
                        setTooltipContext(newContext);
                    }
                },
            },
        },
    };

    const chartData: ChartData<"bar", number[], string> = {
        labels,
        datasets: [
            {
                label: capitalize(participant),
                data,
                backgroundColor: factionResources[participantInput.faction].color,
                borderColor: toDarkerHue(factionResources[participantInput.faction].color, 0.3),
            },
        ],
    };

    const height: number = clamp(
        200,
        max([
            statistics[ParticipantRole.Attacker].survivingUnitProbabilities.length,
            statistics[ParticipantRole.Defender].survivingUnitProbabilities.length,
        ])! * 40,
        800
    );

    return (
        <div>
            <Bar options={options} data={chartData} style={{ height }} />
            <CasualtiesViewTooltip {...props} tooltipContext={tooltipContext} survivingUnitsStatistics={survivingUnitsStatistics} />
        </div>
    );
}

function createTooltipContext(chartJsContext: ChartJSTooltipContext<"bar"> | undefined): TooltipContext {
    if (chartJsContext === undefined || chartJsContext.tooltip.opacity === 0 || chartJsContext.tooltip.dataPoints.length === 0) {
        return defaultTooltipContext;
    }
    const position: DOMRect = chartJsContext.chart.canvas.getBoundingClientRect();
    return {
        open: chartJsContext.tooltip.opacity === 1,
        position: {
            left: position.left + chartJsContext?.tooltip.caretX,
            top: position.top + chartJsContext?.tooltip.caretY,
        },
        dataIndex: chartJsContext.tooltip.dataPoints[0].dataIndex,
    };
}
