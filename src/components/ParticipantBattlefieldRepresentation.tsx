import { Box } from "@mui/material";
import { clamp, round, sum } from "lodash";
import { useEffect, useRef, useState } from "react";

import { unitSizes } from "logic/participant";
import { ParticipantRole, RichParticipant, RichUnit } from "model/calculation";
import { UnitBattlefieldRepresentation } from "./UnitBattlefieldRepresentation";

interface Props {
    role: ParticipantRole;
    participant: RichParticipant;
}

export function ParticipantBattlefieldRepresentation({ role, participant }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1.0);
    useEffect(() => {
        if (containerRef.current) {
            const newScale: number = calculateScale(containerRef.current?.offsetWidth, participant.units);
            if (newScale !== scale) {
                setScale(newScale);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef.current?.offsetWidth, participant.units]);

    return (
        <Box ref={containerRef} sx={{ width: "100%", p: 1 }}>
            {participant.units.map((unit: RichUnit, idx: number) => (
                <UnitBattlefieldRepresentation
                    key={`${unit.input.type}-${idx}`}
                    unit={unit}
                    faction={participant.faction}
                    role={role}
                    scale={scale}
                />
            ))}
        </Box>
    );
}

/**
 * How much of the battlefield do we expect to efficiently fill?
 */
const BATTLEFIELD_FILL_COEFFICIENT = 0.5;

/**
 * Assumed height of the battlefield in pixels
 */
const BATTLEFIELD_HEIGHT = 400;

function calculateScale(containerWidth: number, units: RichUnit[]): number {
    const area: number = BATTLEFIELD_HEIGHT * containerWidth * BATTLEFIELD_FILL_COEFFICIENT;
    const totalUnitArea: number = sum(units.map((unit: RichUnit) => unitSizes[unit.input.type]));
    // Minimum scale: 0.5
    // Maximum scale: 2.0
    // Only change the scale in increments of 0.1
    return round(clamp(Math.sqrt(area / totalUnitArea), 0.5, 2.0), 1);
}
