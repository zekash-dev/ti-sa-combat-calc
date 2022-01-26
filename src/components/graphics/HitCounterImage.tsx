import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const HitCounterImage = React.memo(({ style }: Props) => {
    const path = `${process.env.PUBLIC_URL}/images/sustain_damage.png`;

    return <img src={path} alt="Hit counter" style={style} />;
});
