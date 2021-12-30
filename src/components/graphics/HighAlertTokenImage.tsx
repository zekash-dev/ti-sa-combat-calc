import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const HighAlertTokenImage = React.memo(({ style }: Props) => {
    const path = `${process.env.PUBLIC_URL}/images/highalert.png`;

    return <img src={path} alt="High alert token" style={style} />;
});
