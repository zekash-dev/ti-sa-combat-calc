import { Favorite, PriorityHigh } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

import { AdmiralImage, HitCounterImage, ScientistImage, UnitImage } from "components/graphics";
import { flagshipDefinitions } from "logic/participant";
import { ParticipantRole, UnitInput } from "model/calculation";
import { Faction, UnitTag } from "model/combatTags";
import { unitDefinitions, UnitType } from "model/unit";

interface Props {
    unit: UnitInput;
    faction: Faction;
    role: ParticipantRole;
    scale: number;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function UnitInputImage({ unit, faction, role, scale, style, onClick }: Props) {
    const hasAdmiral: boolean = !!unit.tags && unit.tags[UnitTag.ADMIRAL] === true;
    const hasScientist: boolean = !!unit.tags && unit.tags[UnitTag.SCIENTIST] === true;
    const keepAlive: boolean = !!unit.tags && unit.tags[UnitTag.KEEP_ALIVE] === true;

    return (
        <div
            onClick={onClick}
            style={{
                display: "inline-block",
                margin: 1,
                height: unitDefinitions[unit.type].imageSize.y * scale,
                width: unitDefinitions[unit.type].imageSize.x * scale,
                ...style,
            }}
        >
            <UnitImage
                unitType={unit.type}
                faction={faction}
                role={role}
                scale={scale}
                badges={[
                    unit.type === UnitType.Flagship && flagshipDefinitions[faction].nyi === true && (
                        <Tooltip title="Flagship effect not yet implemented">
                            <PriorityHigh color="error" />
                        </Tooltip>
                    ),
                    hasAdmiral && <AdmiralImage key="admiral" />,
                    hasScientist && <ScientistImage key="scientist" />,
                    keepAlive && <Favorite color="error" />,
                    ...[...Array(unit.sustainedHits)].map((v, idx) => <HitCounterImage key={`hit-${idx}`} />),
                ]}
            />
        </div>
    );
}
