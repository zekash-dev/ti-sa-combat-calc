import { ChevronLeft, ChevronRight, Stars } from "@mui/icons-material";
import { Divider, Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText, styled, Theme, Typography } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FactionImage, TechnologyTypeImage } from "components/graphics";
import {
    availableFactionUpgrades,
    defaultFactionAbilities,
    factionResources,
    getDefaultFactionAbilityValue,
    participantTagResources,
    technologyResources,
} from "logic/participant";
import { ParticipantInput, ParticipantRole } from "model/calculation";
import { Faction, FactionAbility, FactionResources, FactionUpgrade, ParticipantTag, technologies, Technology } from "model/combatTags";
import { selectParticipant, setFaction, setParticipantTag, unsetParticipantTag } from "redux/participant/participantSlice";
import { ParticipantTagListItem } from "./ParticipantTagListItem";
import { SelectFactionDialog } from "./SelectFactionDialog";

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
    const toggleParticipantTag = (tag: ParticipantTag) => () => {
        if (participant.tags[tag] !== undefined) {
            dispatch(unsetParticipantTag({ role, key: tag }));
        } else {
            dispatch(setParticipantTag({ role, key: tag, value: getDefaultFactionAbilityValue(tag) }));
        }
    };
    return (
        <>
            <List dense>
                <ListItem sx={{ visibility: open ? "visible" : "hidden" }}>
                    <ListItemText>Faction</ListItemText>
                </ListItem>
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
                        tag={tag}
                        icon={<TagStarIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                        selected={participant.tags[tag] !== undefined}
                        open={open}
                        onToggle={toggleParticipantTag(tag)}
                    />
                ))}
                {factionUpgrades.length > 0 && (
                    <>
                        <ListItem sx={{ visibility: open ? "visible" : "hidden" }}>
                            <ListItemText>Faction upgrades</ListItemText>
                        </ListItem>
                        {factionUpgrades.map((tag: FactionUpgrade) => (
                            <ParticipantTagListItem
                                key={tag}
                                tag={tag}
                                icon={<TagStarIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                                selected={participant.tags[tag] !== undefined}
                                open={open}
                                onToggle={toggleParticipantTag(tag)}
                            />
                        ))}
                    </>
                )}
                <ListItem sx={{ visibility: open ? "visible" : "hidden" }}>
                    <ListItemText>Technologies</ListItemText>
                </ListItem>
                {technologies.map((tag: Technology) => (
                    <ParticipantTagListItem
                        key={tag}
                        tag={tag}
                        icon={<TechnologyIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                        iconBadge={technologyResources[tag].shortName}
                        selected={participant.tags[tag] !== undefined}
                        open={open}
                        onToggle={toggleParticipantTag(tag)}
                    />
                ))}
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

function TagStarIcon({ tag, selected }: { tag: ParticipantTag; selected: boolean }) {
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

function TechnologyIcon({ tag, selected }: { tag: Technology; selected: boolean }) {
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
