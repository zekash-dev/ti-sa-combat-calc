import React from "react";
import { SvgLoader, SvgProxy } from "react-svgmt";

import { Faction } from "model/combatTags";
import { UnitType } from "model/unit";
import { factionResources } from "logic/participant";
import { toBrighterHue, toDarkerHue } from "logic/styling";
import { ParticipantRole } from "model/calculation";

interface Props {
    unitType: UnitType;
    faction: Faction;
    role: ParticipantRole;
}

export function UnitImage({ unitType, faction, role }: Props) {
    const path = getSvgPath(unitType);
    console.log(path);
    const baseColor: string = factionResources[faction].color;
    const darkColor: string = toDarkerHue(baseColor, 0.3);
    const brightColor: string = toBrighterHue(baseColor, 0.05);
    return (
        <SvgLoader path={path}>
            <SvgProxy selector="svg" width="200px" />
            {role === ParticipantRole.Defender && <SvgProxy selector="g" transform="scale(-1, 1) translate(-100, 0)" />}
            <SvgProxy selector="#color-primary" fill={baseColor} />
            <SvgProxy selector="#color-darker" fill={darkColor} />
            <SvgProxy selector="#color-brighter" fill={brightColor} />
        </SvgLoader>
    );
}

function getSvgPath(unitType: UnitType): string {
    const base = window.location.href;
    const subfolder = "images";
    let imageName: string;
    switch (unitType) {
        case UnitType.WarSun:
            imageName = "warsun.svg";
            break;
        case UnitType.Dreadnought:
            imageName = "dreadnought.svg";
            break;
        case UnitType.Cruiser:
            imageName = "cruiser.svg";
            break;
        case UnitType.Destroyer:
            imageName = "destroyer.svg";
            break;
        case UnitType.Carrier:
            imageName = "carrier.svg";
            break;
        case UnitType.Fighter:
            imageName = "fighter.svg";
            break;
        case UnitType.Flagship:
            imageName = "flagship.svg";
            break;
    }
    return `${base}/${subfolder}/${imageName}`;
}
