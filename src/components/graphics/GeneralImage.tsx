import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const GeneralImage = React.memo(({ style }: Props) => {
    const path = `${window.location.href}/images/leaders/general.png`;

    return <img src={path} alt="General" style={style} />;
});
