import React from "react";

import { CommonParticipantTag } from "model/combatTags";

interface Props {
    tag: CommonParticipantTag;
    style?: React.CSSProperties | undefined;
}

export const CommonParticipantTagImage = React.memo(({ tag, style }: Props) => {
    const path = getImagePath(tag);
    return <img src={path} alt={String(tag)} style={style} />;
});

function getImagePath(tag: CommonParticipantTag): string {
    const base = process.env.PUBLIC_URL;
    const subfolder = "images";
    let imageName: string;
    switch (tag) {
        case CommonParticipantTag.HIGH_ALERT_TOKEN:
            imageName = "highalert.png";
            break;
        case CommonParticipantTag.GENERAL:
            imageName = "leaders/general.png";
            break;
        case CommonParticipantTag.AGENT:
            imageName = "leaders/agent.png";
            break;
        default:
            console.warn(`No image found for tag ${tag}`);
            return "";
    }
    return `${base}/${subfolder}/${imageName}`;
}
