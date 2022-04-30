import { Fade, Paper, PopoverPosition, Popper, Typography } from "@mui/material";
import { useDebounce } from "hooks/useDebounce";
import { round } from "lodash";
import { useEffect, useState } from "react";

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

type VirtualElement = {
    getBoundingClientRect: () => DOMRect;
    contextElement?: Element;
};
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

function createVirtualElement(x: number, y: number): VirtualElement {
    return {
        getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
    };
}
export function CasualtiesViewTooltip(props: CasualtiesViewTooltipProps) {
    const { participants, participant, survivingUnitsStatistics, tooltipContext } = props;
    const participantInput: ParticipantInput = participants[participant];
    const [stickyDataIndex, setStickyDataIndex] = useState<number>(tooltipContext.dataIndex);

    const survivingUnits: SurvivingUnitsStatistics | undefined = survivingUnitsStatistics[stickyDataIndex];
    const sortedUnits: UnitInput[] = [...(survivingUnits?.units ?? [])].sort(unitInputSizeComparer);

    const [anchorEl, setAnchorEl] = useState<VirtualElement>(createVirtualElement(0, 0));

    const visible: boolean = useDebounce(tooltipContext.open, 50);

    useEffect(() => {
        if (tooltipContext.position !== defaultTooltipContext.position) {
            setAnchorEl(createVirtualElement(tooltipContext.position.left, tooltipContext.position.top));

            // Reposition the popper after rendering to make sure it's positioned correctly
            setTimeout(() => {
                setAnchorEl(createVirtualElement(tooltipContext.position.left, tooltipContext.position.top));
            }, 50);
        }
    }, [setAnchorEl, tooltipContext.position]);
    useEffect(() => {
        // Retain the previous data index to prevent flickers when fading out the popper
        if (tooltipContext.dataIndex !== defaultTooltipContext.dataIndex) {
            setStickyDataIndex(tooltipContext.dataIndex);
        }
    }, [setStickyDataIndex, tooltipContext.dataIndex]);

    return (
        <Popper
            open={tooltipContext.open}
            anchorEl={anchorEl}
            placement={participant === ParticipantRole.Attacker ? "right" : "left"}
            transition
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            maxWidth: 300,
                            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.10))",
                            visibility: visible ? "visible" : "hidden",
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {survivingUnits && `Σ ${round(survivingUnits.probabilityThisOrBetter * 100, 2)}%: this or better`}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: "1.1em", fontWeight: "bold" }}>
                            {survivingUnits &&
                                `${round(survivingUnits.probability * 100, 2)}%: ${survivingUnits.units.length} surviving units`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {survivingUnits && `Σ ${round(survivingUnits.probabilityThisOrWorse * 100, 2)}%: this or worse`}
                        </Typography>
                        {sortedUnits.map((unit: UnitInput, idx: number) => (
                            <UnitInputImage
                                key={`${unit.type}-${idx}`}
                                unit={unit}
                                faction={participantInput.faction}
                                role={participant}
                                scale={1.0}
                            />
                        ))}
                    </Paper>
                </Fade>
            )}
        </Popper>
    );
}
