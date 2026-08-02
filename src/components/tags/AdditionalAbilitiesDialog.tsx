import { alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography } from "@mui/material";

import { getAllEnumValues } from "logic/common";
import {
    availableFactionUpgrades,
    defaultFactionAbilities,
    factionResources,
    getParticipantTagDefaultValue,
    participantTagResources,
} from "logic/participant";
import { ParticipantInput, ParticipantRole } from "model/calculation";
import { Faction, ParticipantTag, ParticipantTagResources } from "model/combatTags";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setParticipantTag, unsetParticipantTag } from "redux/participant/participantSlice";
import { FactionImage } from "components/graphics";
import { Stars } from "@mui/icons-material";
import { ParticipantTagTooltip } from "./ParticipantTagTooltip";

interface Props {
    open: boolean;
    role: ParticipantRole;
    participant: ParticipantInput;
    onClose: () => void;
}

interface FactionAndTag {
    faction: Faction;
    tag: ParticipantTag;
}

export function AdditionalAbilitiesDialog({ open, role, participant, onClose }: Props) {
    const dispatch = useDispatch();

    const tags: FactionAndTag[] = useMemo(() => {
        const otherFaction: Faction[] = getAllEnumValues<Faction>(Faction).filter((f) => f !== participant.faction);
        const ret: FactionAndTag[] = otherFaction.flatMap((f) =>
            [...defaultFactionAbilities[f], ...availableFactionUpgrades[f]]
                .filter((t) => participantTagResources[t].implementation)
                .map((t) => ({ faction: f, tag: t })),
        );
        return ret;
    }, [participant.faction]);

    const onChange = useCallback(
        (key: ParticipantTag, selected: boolean, value?: any) => {
            if (selected) {
                dispatch(setParticipantTag({ role, key, value }));
            } else {
                dispatch(unsetParticipantTag({ role, key }));
            }
        },
        [dispatch, role],
    );

    return (
        <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
            <DialogTitle sx={{ textAlign: "center", color: "text.primary" }}>Additional abilities</DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    {tags.map((tag: FactionAndTag) => (
                        <Grid key={tag.tag} item xs={12} sm={6} md={4}>
                            <AbilityButton participant={participant} faction={tag.faction} tag={tag.tag} onChange={onChange} />
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

interface AbilityButtonProps {
    participant: ParticipantInput;
    faction: Faction;
    tag: ParticipantTag;
    onChange: (key: ParticipantTag, selected: boolean, value?: any) => void;
}

function AbilityButton({ participant, faction, tag, onChange }: AbilityButtonProps) {
    const tagResources: ParticipantTagResources = participantTagResources[tag];
    const selected: boolean = participant.tags[tag] !== undefined;

    const title: string = tagResources.name;
    const description: string = Array.isArray(tagResources.description) ? tagResources.description.join(" ") : tagResources.description;

    const onToggle = useCallback(() => {
        if (selected) {
            onChange(tag, false);
        } else {
            onChange(tag, true, getParticipantTagDefaultValue(tag));
        }
    }, [onChange, tag, selected]);

    return (
        <ParticipantTagTooltip tag={tagResources} placement="right">
            <Button
                disabled={!tagResources.implementation}
                disableRipple
                variant="text"
                onClick={onToggle}
                sx={{
                    justifyContent: "left",
                    width: "100%",
                    height: "80px",
                    color: factionResources[faction].color,
                    backgroundColor: selected ? alpha(factionResources[faction].color, 0.4) : "transparent",
                    borderWidth: "5px",
                    borderStyle: "solid",
                    borderColor: alpha(factionResources[faction].color, selected ? 1.0 : 0.3),
                    fontSize: "1.1em",
                    "&:hover": {
                        borderWidth: "5px",
                        backgroundColor: alpha(factionResources[faction].color, selected ? 0.4 : 0.1),
                    },
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                    <FactionImage faction={faction} style={{ width: "32px", opacity: selected ? 1.0 : 0.5 }} />

                    {/* Middle text */}
                    <Box
                        sx={{
                            textAlign: "left",
                            flex: 1,
                            minWidth: 0, // Required for ellipsis inside flex layouts
                        }}
                    >
                        <Typography variant="subtitle1" color="text.primary" noWrap>
                            {title}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                                fontSize: "0.7em",
                                textTransform: "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {description}
                        </Typography>
                    </Box>

                    <Stars
                        sx={{
                            marginLeft: "auto",
                            fontSize: 50,
                            color: participantTagResources[tag].color,
                            filter: selected ? undefined : "grayscale(0.8)",
                            opacity: selected ? undefined : "0.7",
                            borderRadius: "50%",
                            borderStyle: "solid",
                            borderWidth: "2px",
                            borderColor: selected ? "#DDDDDD" : "transparent",
                        }}
                    />
                </Stack>
            </Button>
        </ParticipantTagTooltip>
    );
}
