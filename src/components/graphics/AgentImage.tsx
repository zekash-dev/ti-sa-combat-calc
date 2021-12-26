import React from "react";

interface Props {
    style?: React.CSSProperties | undefined;
}

export const AgentImage = React.memo(({ style }: Props) => {
    const path = `${window.location.href}/images/leaders/agent.png`;

    return <img src={path} alt="Agent" style={style} />;
});
