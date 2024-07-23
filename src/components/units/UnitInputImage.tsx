import { Favorite, PriorityHigh } from "@mui/icons-material";
import React from "react";

import { AdmiralImage, HitCounterImage, ScientistImage, UnitCustomModImage, UnitImage } from "components/graphics";
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
    const customModType: "positive" | "negative" | undefined = getUnitCustomModType(unit);

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
                    unit.type === UnitType.Flagship &&
                        flagshipDefinitions[faction].nyi === true && {
                            key: "flagship-nyi",
                            element: <PriorityHigh color="error" />,
                            tooltip: "Flagship effect not yet implemented",
                        },
                    hasAdmiral && <AdmiralImage key="admiral" />,
                    hasScientist && <ScientistImage key="scientist" />,
                    keepAlive && <Favorite key="keep-alive" color="error" />,
                    ...[...Array(unit.sustainedHits + (unit.usedPlanetaryShields ?? 0))].map((v, idx) => (
                        <HitCounterImage key={`hit-${idx}`} />
                    )),
                    customModType !== undefined && {
                        key: "custom-mods",
                        tooltip: "Unit has custom settings",
                        element: <UnitCustomModImage modType={customModType} />,
                    },
                ]}
            />
        </div>
    );
}

function getUnitCustomModType(unit: UnitInput): "positive" | "negative" | undefined {
    return getTagModType(UnitTag.COMBAT_VALUE_MOD) || getTagModType(UnitTag.COMBAT_DICE_MOD);

    function getTagModType(tag: UnitTag): "positive" | "negative" | undefined {
        if (!unit.tags) return undefined;

        const val = unit.tags[tag];
        if (!val) return undefined;

        const numberVal: number = Number(val);
        if (isNaN(numberVal) || numberVal === 0) return undefined;

        return numberVal > 0 ? "positive" : "negative";
    }
}
