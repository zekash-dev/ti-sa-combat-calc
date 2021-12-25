import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const HitCounterImage = React.memo(({ style }: Props) => {
    const path = `${window.location.href}/images/hitCounter.png`;

    return <img src={path} alt="Hit counter" style={style} />;
});
