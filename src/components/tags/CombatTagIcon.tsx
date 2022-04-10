import { CombatTagImage } from "components/graphics";
import { CombatTag } from "model/combatTags";

interface Props {
    tag: CombatTag;
    selected: boolean;
}

export function CombatTagIcon({ tag, selected }: Props) {
    return (
        <CombatTagImage
            tag={tag}
            style={{
                width: 30,
                marginLeft: "auto",
                marginRight: "auto",
                filter: selected ? undefined : "grayscale(0.3)",
                opacity: selected ? undefined : "0.9",
                borderRadius: "50%",
                borderStyle: "solid",
                borderWidth: "3px",
                borderColor: selected ? "#DDDDDD" : "transparent",
            }}
        />
    );
}
