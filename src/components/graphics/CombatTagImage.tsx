import React from "react";

import { CombatTag } from "model/combatTags";

interface Props {
    tag: CombatTag;
    style?: React.CSSProperties | undefined;
}

export const CombatTagImage = React.memo(({ tag, style }: Props) => {
    const path = getImagePath(tag);
    return <img src={path} alt={String(tag)} style={style} />;
});

function getImagePath(tag: CombatTag): string {
    const base = process.env.PUBLIC_URL;
    const subfolder = "images";
    let imageName: string;
    switch (tag) {
        case CombatTag.NEBULA:
            imageName = "nebula.png";
            break;
        case CombatTag.ION_STORM:
            imageName = "ion_storm.png";
            break;
    }
    return `${base}/${subfolder}/${imageName}`;
}
