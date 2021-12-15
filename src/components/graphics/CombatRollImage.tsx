import React from "react";
import { SvgLoader, SvgProxy } from "react-svgmt";

import { KeyedDictionary } from "model/common";

interface Props {
    combatValue: number;
    width: number;
    height: number;
}

export const CombatRollImage = React.memo(({ combatValue, width, height }: Props) => {
    const [loaded, setLoaded] = React.useState(false);
    const handleLoaded = () => setLoaded(true);
    const path: string = getSvgPath(combatValue);
    const baseColor: string = diceColors[combatValue] ?? diceColors[10];
    const textColor: string = getTextColor(combatValue);

    // Let the image load before showing it, to prevent flickers while the SvgProxys are being handled
    return (
        <div
            style={{
                display: "inline-block",
                padding: 1,
                height,
                width,
                visibility: loaded ? "visible" : "hidden",
            }}
        >
            <SvgLoader path={path} onSVGReady={handleLoaded}>
                <SvgProxy selector="svg" width="100%" height="100%" />
                <SvgProxy selector="#color-primary" fill={baseColor} />
                <SvgProxy selector="#color-text" fill={textColor} />
            </SvgLoader>
        </div>
    );
});

function getSvgPath(combatValue: number): string {
    const base = window.location.href;
    const subfolder = "images/dice";
    let imageName: string;
    switch (combatValue) {
        case 10:
            imageName = "d10-10.svg";
            break;
        case 9:
            imageName = "d10-9.svg";
            break;
        case 8:
            imageName = "d10-8.svg";
            break;
        case 7:
            imageName = "d10-7.svg";
            break;
        case 6:
            imageName = "d10-6.svg";
            break;
        case 5:
            imageName = "d10-5.svg";
            break;
        case 4:
            imageName = "d10-4.svg";
            break;
        case 3:
            imageName = "d10-3.svg";
            break;
        case 2:
            imageName = "d10-2.svg";
            break;
        case 1:
            imageName = "d10-1.svg";
            break;
        default:
            imageName = "d10-10.svg";
            break;
    }
    return `${base}/${subfolder}/${imageName}`;
}

const diceColors: KeyedDictionary<number, string> = {
    1: "#F570CE",
    2: "#F570CE",
    3: "#A020F0",
    4: "#1E87FF",
    5: "#21B19B",
    6: "#31B32B",
    7: "#CDCB12",
    8: "#F4641D",
    9: "#DA1918",
    10: "#713B17",
};

function getTextColor(combatValue: number): string {
    switch (combatValue) {
        case 7:
            return "#000000";
        default:
            return "#FFFFFF";
    }
}
