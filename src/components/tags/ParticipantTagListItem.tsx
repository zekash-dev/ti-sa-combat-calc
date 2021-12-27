import { CheckBox, CheckBoxOutlineBlank, SubdirectoryArrowRight } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material";
import { useCallback } from "react";

import { participantTagSettingsUi } from "components/effectSettings";
import { getParticipantTagDefaultValue, participantTagResources } from "logic/participant";
import { ParticipantInput } from "model/calculation";
import { ParticipantTag, ParticipantTagResources } from "model/combatTags";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";
import { ParticipantTagBadge } from "./ParticipantTagBadge";

interface Props {
    participant: ParticipantInput;
    tag: ParticipantTag;
    icon?: JSX.Element;
    iconBadge?: string;
    open: boolean;
    onChange: (key: ParticipantTag, selected: boolean, value?: any) => void;
}

export function ParticipantTagListItem({ participant, tag, icon, iconBadge, open, onChange }: Props) {
    const tagResources: ParticipantTagResources = participantTagResources[tag];
    const SettingsUi: React.FC<ParticipantTagCustomSettingsUiProps> | undefined = participantTagSettingsUi[tag];
    const tagTitle: string = (tagResources.implementation ? "" : "[NYI] ") + tagResources.name;
    const selected: boolean = participant.tags[tag] !== undefined;

    let iconElement: JSX.Element | undefined = undefined;
    if (icon) {
        iconElement = <ListItemIcon>{icon}</ListItemIcon>;
        if (iconBadge) {
            iconElement = <ParticipantTagBadge text={iconBadge}>{iconElement}</ParticipantTagBadge>;
        }
    }

    const onToggle = useCallback(() => {
        if (selected) {
            onChange(tag, false);
        } else {
            onChange(tag, true, getParticipantTagDefaultValue(tag));
        }
    }, [onChange, tag, selected]);

    const onSettingsChange = useCallback(
        (newSettings: any) => {
            onChange(tag, true, newSettings);
        },
        [onChange, tag]
    );

    let listItem: JSX.Element = (
        <ListItem button disabled={!tagResources.implementation} disableRipple onClick={onToggle} disableGutters>
            {iconElement}
            {open && (
                <>
                    <ListItemText>
                        <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            {tagTitle}
                        </Typography>
                    </ListItemText>
                    {!!tagResources.implementation && (
                        <ListItemIcon>{selected ? <CheckBox color="primary" /> : <CheckBoxOutlineBlank color="disabled" />}</ListItemIcon>
                    )}
                </>
            )}
        </ListItem>
    );

    if (!open) {
        listItem = (
            <Tooltip title={tagTitle} placement="right">
                <span>{listItem}</span>
            </Tooltip>
        );
    }

    if (SettingsUi && open && selected) {
        listItem = (
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                {listItem}
                <ListItem disableGutters>
                    <ListItemIcon>
                        <SubdirectoryArrowRight
                            sx={{
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText>{<SettingsUi settings={participant.tags[tag]} onSettingsChange={onSettingsChange} />}</ListItemText>
                </ListItem>
            </div>
        );
    }
    return listItem;
}
