import { TechnologyTypeImage } from "components/graphics";
import { technologyResources } from "logic/participant";
import { Technology } from "model/combatTags";

interface Props {
    tag: Technology;
    selected: boolean;
}

export function TechnologyIcon({ tag, selected }: Props) {
    return (
        <TechnologyTypeImage
            technologyType={technologyResources[tag].type}
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
