import React from "react";

import { TechnologyType } from "model/combatTags";

interface Props {
    technologyType: TechnologyType;
    style?: React.CSSProperties | undefined;
}

export const TechnologyTypeImage = React.memo(({ technologyType, style }: Props) => {
    const path = getImagePath(technologyType);

    return <img src={path} alt={technologyType} style={style} />;
});

function getImagePath(technologyType: TechnologyType): string {
    const base = process.env.PUBLIC_URL;
    const subfolder = "images/technologyTypes";
    let imageName: string;
    switch (technologyType) {
        case TechnologyType.BLUE:
            imageName = "blue.png";
            break;
        case TechnologyType.GREEN:
            imageName = "green.png";
            break;
        case TechnologyType.RED:
            imageName = "red.png";
            break;
        case TechnologyType.YELLOW:
            imageName = "yellow.png";
            break;
    }
    return `${base}/${subfolder}/${imageName}`;
}
