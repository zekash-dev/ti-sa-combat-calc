import { Popover, PopoverPosition, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { round } from "lodash";

import { UnitInputImage } from "components/units/UnitInputImage";
import { unitInputSizeComparer } from "logic/participant";
import {
    CalculationInput,
    ParticipantInput,
    ParticipantRole,
    StatisticsBase,
    SurvivingUnitsStatistics,
    UnitInput,
} from "model/calculation";
import { KeyedDictionary } from "model/common";

export interface TooltipContext {
    open: boolean;
    position: PopoverPosition;
    dataIndex: number;
}

export const defaultTooltipContext: TooltipContext = {
    open: false,
    position: { left: 0, top: 0 },
    dataIndex: -1,
};

interface CasualtiesViewTooltipProps {
    input: CalculationInput;
    statistics: KeyedDictionary<ParticipantRole, StatisticsBase>;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
    participant: ParticipantRole;
    survivingUnitsStatistics: SurvivingUnitsStatistics[];
    tooltipContext: TooltipContext;
}

export function CasualtiesViewTooltip(props: CasualtiesViewTooltipProps) {
    const { participants, participant, survivingUnitsStatistics, tooltipContext } = props;
    const participantInput: ParticipantInput = participants[participant];

    const survivingUnits: SurvivingUnitsStatistics | undefined = survivingUnitsStatistics[tooltipContext.dataIndex];
    const sortedUnits: UnitInput[] = [...(survivingUnits?.units ?? [])].sort(unitInputSizeComparer);
    return (
        <Popover
            open={tooltipContext.open}
            sx={{
                pointerEvents: "none",
            }}
            anchorReference="anchorPosition"
            anchorPosition={tooltipContext.position}
            anchorOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: participant === ParticipantRole.Attacker ? "left" : "right",
            }}
            disableScrollLock
        >
            {survivingUnits && (
                <Box sx={{ p: 2, width: "100%", overflow: "visible" }}>
                    <Typography variant="body1">
                        {round(survivingUnits.probability * 100, 2)}%: {survivingUnits.units.length} surviving units
                    </Typography>
                    <Box sx={{ maxWidth: 300 }}>
                        {sortedUnits.map((unit: UnitInput, idx: number) => (
                            <UnitInputImage
                                key={`${unit.type}-${idx}`}
                                unit={unit}
                                faction={participantInput.faction}
                                role={participant}
                                scale={1.0}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Popover>
    );
}
