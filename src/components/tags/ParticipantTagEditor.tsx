import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Divider, Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText, styled, Theme, Typography } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FactionImage } from "components/graphics";
import { availableFactionUpgrades, defaultFactionAbilities, factionResources, technologyResources } from "logic/participant";
import { ParticipantInput, ParticipantRole } from "model/calculation";
import {
    CommonParticipantTag,
    Faction,
    FactionAbility,
    FactionResources,
    FactionUpgrade,
    ParticipantTag,
    technologies,
    Technology,
} from "model/combatTags";
import { selectParticipant, setFaction, setParticipantTag, unsetParticipantTag } from "redux/participant/participantSlice";
import { CommonParticipantTagIcon } from "./CommonParticipantTagIcon";
import { ParticipantTagListItem } from "./ParticipantTagListItem";
import { SelectFactionDialog } from "./SelectFactionDialog";
import { TagStarIcon } from "./TagStarIcon";
import { TechnologyIcon } from "./TechnologyIcon";
import { ParticipantCombatValueModEditor } from "./ParticipantCombatValueModEditor";

interface Props {
    location: "left" | "right";
    role: ParticipantRole;
    open: boolean;
    onOpenChange: (value: boolean) => void;
}

export function ParticipantTagEditor(props: Props) {
    const { location, open, onOpenChange } = props;
    const toggleDrawer = () => onOpenChange(!open);
    return (
        <Drawer variant="permanent" open={open} anchor={location} sx={{ ".MuiDrawer-paper": { maxHeight: "100vh", overflow: "hidden" } }}>
            <ListItem button onClick={toggleDrawer} sx={{ justifyContent: location === "right" ? "left" : "right" }}>
                {(location === "right") !== open ? <ChevronLeft fontSize="large" /> : <ChevronRight fontSize="large" />}
            </ListItem>
            <Divider />
            <OverlayScrollbarsComponent style={{ height: "calc(100% - 10px)" }} options={{ overflowBehavior: { x: "hidden" } }}>
                <DrawerContent {...props} open={open} />
            </OverlayScrollbarsComponent>
        </Drawer>
    );
}

interface DrawerContentProps extends Props {
    open: boolean;
}

function DrawerContent({ role, open }: DrawerContentProps) {
    const dispatch = useDispatch();
    const [factionDialogOpen, setFactionDialogOpen] = useState(false);
    const openFactionDialog = () => setFactionDialogOpen(true);
    const closeFactionDialog = () => setFactionDialogOpen(false);

    const participant: ParticipantInput = useSelector(selectParticipant(role));
    const faction: FactionResources = factionResources[participant.faction];
    const factionAbilities: FactionAbility[] = defaultFactionAbilities[participant.faction];
    const factionUpgrades: FactionUpgrade[] = availableFactionUpgrades[participant.faction];

    const handleSelectFaction = (newValue: Faction) => dispatch(setFaction({ role: role, faction: newValue }));
    const handleTagChanged = (tag: ParticipantTag, selected: boolean, value: any) => {
        if (selected) {
            dispatch(setParticipantTag({ role, key: tag, value }));
        } else {
            dispatch(unsetParticipantTag({ role, key: tag }));
        }
    };
    return (
        <>
            <List dense>
                {open && (
                    <ListItem>
                        <ListItemText>Faction</ListItemText>
                    </ListItem>
                )}
                <ListItem button disableRipple disableGutters onClick={openFactionDialog}>
                    <ListItemIcon>
                        <FactionImage faction={participant.faction} style={{ width: "30px", marginLeft: "auto", marginRight: "auto" }} />
                    </ListItemIcon>
                    {open && (
                        <ListItemText>
                            <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                {faction.name}
                            </Typography>
                        </ListItemText>
                    )}
                </ListItem>
                {factionAbilities.map((tag: FactionAbility) => (
                    <ParticipantTagListItem
                        key={tag}
                        participant={participant}
                        tag={tag}
                        icon={<TagStarIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                        open={open}
                        onChange={handleTagChanged}
                    />
                ))}
                {factionUpgrades.length > 0 && (
                    <>
                        {open && (
                            <ListItem>
                                <ListItemText>Faction upgrades</ListItemText>
                            </ListItem>
                        )}
                        {factionUpgrades.map((tag: FactionUpgrade) => (
                            <ParticipantTagListItem
                                key={tag}
                                participant={participant}
                                tag={tag}
                                icon={<TagStarIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                                open={open}
                                onChange={handleTagChanged}
                            />
                        ))}
                    </>
                )}
                {open && (
                    <ListItem>
                        <ListItemText>Technologies</ListItemText>
                    </ListItem>
                )}
                {technologies.map((tag: Technology) => (
                    <ParticipantTagListItem
                        key={tag}
                        participant={participant}
                        tag={tag}
                        icon={<TechnologyIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                        iconBadge={technologyResources[tag].shortName}
                        open={open}
                        onChange={handleTagChanged}
                    />
                ))}
                {open && (
                    <ListItem>
                        <ListItemText>Other</ListItemText>
                    </ListItem>
                )}
                <ParticipantTagListItem
                    participant={participant}
                    tag={CommonParticipantTag.HIGH_ALERT_TOKEN}
                    icon={
                        <CommonParticipantTagIcon
                            tag={CommonParticipantTag.HIGH_ALERT_TOKEN}
                            selected={participant.tags[CommonParticipantTag.HIGH_ALERT_TOKEN] !== undefined}
                        />
                    }
                    open={open}
                    onChange={handleTagChanged}
                />
                <ParticipantTagListItem
                    participant={participant}
                    tag={CommonParticipantTag.GENERAL}
                    icon={
                        <CommonParticipantTagIcon
                            tag={CommonParticipantTag.GENERAL}
                            selected={participant.tags[CommonParticipantTag.GENERAL] !== undefined}
                        />
                    }
                    open={open}
                    onChange={handleTagChanged}
                />
                <ParticipantTagListItem
                    participant={participant}
                    tag={CommonParticipantTag.AGENT}
                    icon={
                        <CommonParticipantTagIcon
                            tag={CommonParticipantTag.AGENT}
                            selected={participant.tags[CommonParticipantTag.AGENT] !== undefined}
                        />
                    }
                    open={open}
                    onChange={handleTagChanged}
                />
                <ParticipantCombatValueModEditor open={open} role={role} />
            </List>
            <SelectFactionDialog
                open={factionDialogOpen}
                onClose={closeFactionDialog}
                currentValue={participant.faction}
                onSelect={handleSelectFaction}
            />
        </>
    );
}

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

const drawerWidth = 340;

const openedMixin = (theme: Theme): React.CSSProperties => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): React.CSSProperties => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: 56,
});
