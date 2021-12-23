import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material";

import { participantTagResources } from "logic/participant";
import { ParticipantTag, ParticipantTagResources } from "model/combatTags";
import { ParticipantTagBadge } from "./ParticipantTagBadge";

interface Props {
    tag: ParticipantTag;
    icon?: JSX.Element;
    iconBadge?: string;
    selected: boolean;
    open: boolean;
    onToggle: (key: ParticipantTag) => void;
}

export function ParticipantTagListItem({ tag, icon, iconBadge, selected, open, onToggle }: Props) {
    const tagResources: ParticipantTagResources = participantTagResources[tag];
    const tagTitle: string = (tagResources.implementation ? "" : "[NYI] ") + tagResources.name;

    let iconElement: JSX.Element | undefined = undefined;
    if (icon) {
        iconElement = <ListItemIcon>{icon}</ListItemIcon>;
        if (iconBadge) {
            iconElement = <ParticipantTagBadge text={iconBadge}>{iconElement}</ParticipantTagBadge>;
        }
    }

    const listItem: JSX.Element = (
        <ListItem button disabled={!tagResources.implementation} disableRipple onClick={() => onToggle(tag)} disableGutters>
            {iconElement}
            {open && (
                <>
                    <ListItemText>
                        <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            {tagTitle}
                        </Typography>
                    </ListItemText>
                    {!!tagResources.implementation && <ListItemIcon>{selected ? <CheckBox /> : <CheckBoxOutlineBlank />}</ListItemIcon>}
                </>
            )}
        </ListItem>
    );

    if (!open) {
        return (
            <Tooltip title={tagTitle} placement="right">
                <span>{listItem}</span>
            </Tooltip>
        );
    } else {
        return listItem;
    }
}
