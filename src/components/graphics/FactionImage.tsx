import React from "react";

import { Faction } from "model/combatTags";

interface Props {
    faction: Faction;
    style?: React.CSSProperties | undefined;
}

export const FactionImage = React.memo(({ faction, style }: Props) => {
    const path = getImagePath(faction);

    return <img src={path} alt={Faction[faction]} style={style} />;
});

function getImagePath(faction: Faction): string {
    const base = process.env.PUBLIC_URL;
    const subfolder = "images/factions";
    let imageName: string;
    switch (faction) {
        case Faction.BARONY_OF_LETNEV:
            imageName = "letnev.png";
            break;
        case Faction.CLAN_OF_SAAR:
            imageName = "saar.png";
            break;
        case Faction.EMIRATES_OF_HACAN:
            imageName = "hacan.png";
            break;
        case Faction.FEDERATION_OF_SOL:
            imageName = "sol.png";
            break;
        case Faction.MENTAK_COALITION:
            imageName = "mentak.png";
            break;
        case Faction.NAALU_COLLECTIVE:
            imageName = "naalu.png";
            break;
        case Faction.KROTOAN_VIRUS:
            imageName = "virus.png";
            break;
        case Faction.HIVES_OF_SARDAKK_NORR:
            imageName = "sardakknorr.png";
            break;
        case Faction.UNIVERSITIES_OF_JOLNAR:
            imageName = "jolnar.png";
            break;
        case Faction.WINNU_SOVEREIGNTY:
            imageName = "winnu.png";
            break;
        case Faction.XXCHA_KINGDOM:
            imageName = "xxcha.png";
            break;
        case Faction.TRIBES_OF_YSSARIL:
            imageName = "yssaril.png";
            break;
        case Faction.YIN_BROTHERHOOD:
            imageName = "yin.png";
            break;
        case Faction.EMBERS_OF_MUAAT:
            imageName = "muaat.png";
            break;
        case Faction.GHOSTS_OF_CREUSS:
            imageName = "creuss.png";
            break;
        case Faction.LIZIX_MINDNET:
            imageName = "lizix.png";
            break;
        case Faction.ARBOREC_ECOSYSTEM:
            imageName = "arborec.png";
            break;
        case Faction.ORDER_OF_THE_LAST:
            imageName = "sol.png"; // Placeholder
            break;
    }
    return `${base}/${subfolder}/${imageName}`;
}
