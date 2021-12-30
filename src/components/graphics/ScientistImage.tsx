import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const ScientistImage = React.memo(({ style }: Props) => {
    const path = `${process.env.PUBLIC_URL}/images/leaders/scientist.png`;

    return <img src={path} alt="Scientist" style={style} />;
});
