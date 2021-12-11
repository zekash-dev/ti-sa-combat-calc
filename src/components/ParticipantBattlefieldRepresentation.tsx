import { Box } from "@mui/material";
import { clamp, round, sum } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { unitSizeComparer, unitSizes } from "logic/participant";
import { ParticipantInput, ParticipantRole, UnitInput } from "model/calculation";
import { unitDefinitions } from "model/unit";
import { selectParticipant } from "redux/participant/participantSlice";
import { UnitImage } from "./graphics/UnitImage";

interface Props {
    role: ParticipantRole;
}

export function ParticipantBattlefieldRepresentation({ role }: Props) {
    const participant: ParticipantInput = useSelector(selectParticipant(role));
    const sortedUnits: UnitInput[] = [...participant.units].sort(unitSizeComparer);

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
            {sortedUnits.map((unit: UnitInput, idx: number) => (
                <UnitImage
                    key={`${unit.type}-${idx}`}
                    unitType={unit.type}
                    faction={participant.faction}
                    role={role}
                    width={unitDefinitions[unit.type].imageWidth * scale}
                    height={unitDefinitions[unit.type].imageHeight * scale}
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

function calculateScale(containerWidth: number, units: UnitInput[]): number {
    const area: number = BATTLEFIELD_HEIGHT * containerWidth * BATTLEFIELD_FILL_COEFFICIENT;
    const totalUnitArea: number = sum(units.map((unit: UnitInput) => unitSizes[unit.type]));
    // Minimum scale: 0.5
    // Maximum scale: 2.0
    // Only change the scale in increments of 0.1
    return round(clamp(Math.sqrt(area / totalUnitArea), 0.5, 2.0), 1);
}
