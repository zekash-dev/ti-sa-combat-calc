import { CommonParticipantTagImage } from "components/graphics";
import { CommonParticipantTag } from "model/combatTags";

interface Props {
    tag: CommonParticipantTag;
    selected: boolean;
}

export function CommonParticipantTagIcon({ tag, selected }: Props) {
    return (
        <CommonParticipantTagImage
            tag={tag}
            style={{
                width: 30,
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
