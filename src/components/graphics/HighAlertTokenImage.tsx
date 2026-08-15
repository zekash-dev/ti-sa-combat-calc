import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const HighAlertTokenImage = React.memo(({ style }: Props) => {
    const path = `${import.meta.env.BASE_URL}/images/highalert.png`;

    return <img src={path} alt="High alert token" style={style} />;
});
