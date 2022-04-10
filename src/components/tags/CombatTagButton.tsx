import { IconButton, Tooltip } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getParticipantTagDefaultValue, participantTagResources } from "logic/participant";
import { ParticipantInputTags } from "model/calculation";
import { CombatTag, ParticipantTagResources } from "model/combatTags";
import { selectCombatTags, setCombatTag, unsetCombatTag } from "redux/participant/participantSlice";
import { CombatTagIcon } from "./CombatTagIcon";

interface Props {
    tag: CombatTag;
    iconBadge?: string;
}

export function CombatTagButton({ tag, iconBadge }: Props) {
    const dispatch = useDispatch();
    const tags: ParticipantInputTags = useSelector(selectCombatTags);
    const tagResources: ParticipantTagResources = participantTagResources[tag];
    const tagTitle: string = (tagResources.implementation ? "" : "[NYI] ") + tagResources.name;
    const selected: boolean = tags[tag] !== undefined;

    const onToggle = useCallback(() => {
        if (!selected) {
            dispatch(setCombatTag({ key: tag, value: getParticipantTagDefaultValue(tag) }));
        } else {
            dispatch(unsetCombatTag({ key: tag }));
        }
    }, [dispatch, selected, tag]);

    return (
        <Tooltip title={tagTitle} placement="bottom">
            <span>
                <IconButton size="small" disabled={!tagResources.implementation} disableRipple onClick={onToggle}>
                    <CombatTagIcon tag={tag} selected={selected} />
                </IconButton>
            </span>
        </Tooltip>
    );
}
