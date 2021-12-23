import { styled } from "@mui/material";

interface Props {
    text: string;
    children: JSX.Element;
}

export function ParticipantTagBadge({ text, children }: Props) {
    return (
        <BadgeContainer>
            {children}
            <BadgeTextHolder>
                <BadgeText>{text}</BadgeText>
            </BadgeTextHolder>
        </BadgeContainer>
    );
}

const BadgeContainer = styled("span")({
    position: "relative",
    display: "inline-flex",
});

const BadgeTextHolder = styled("span")({
    display: "-webkit-box",
    WebkitBoxPack: "center",
    position: "absolute",
    transform: "scale(1) translate(0, 50%)",
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: "0.7em",
});

const BadgeText = styled("span")((props) => ({
    padding: "0 5px",
    borderRadius: 5,
    backgroundColor: props.theme.palette.background.paper,
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
}));
