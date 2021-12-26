import { Stars } from "@mui/icons-material";

import { participantTagResources } from "logic/participant";
import { ParticipantTag } from "model/combatTags";

interface Props {
    tag: ParticipantTag;
    selected: boolean;
}

export function TagStarIcon({ tag, selected }: Props) {
    return (
        <Stars
            sx={{
                fontSize: 32,
                color: participantTagResources[tag].color,
                marginLeft: "auto",
                marginRight: "auto",
                filter: selected ? undefined : "grayscale(0.8)",
                opacity: selected ? undefined : "0.7",
                borderRadius: "50%",
                borderStyle: "solid",
                borderWidth: "2px",
                borderColor: selected ? "#DDDDDD" : "transparent",
            }}
        />
    );
}
