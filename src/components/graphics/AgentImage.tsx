import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const AgentImage = React.memo(({ style }: Props) => {
    const path = `${import.meta.env.BASE_URL}/images/leaders/agent.png`;

    return <img src={path} alt="Agent" style={style} />;
});
