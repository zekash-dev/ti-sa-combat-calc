import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const AdmiralImage = React.memo(({ style }: Props) => {
    const path = `${process.env.PUBLIC_URL}/images/leaders/admiral.png`;

    return <img src={path} alt="Admiral" style={style} />;
});
