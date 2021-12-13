import { CheckBox, CheckBoxOutlineBlank, ChevronLeft, ChevronRight, Stars } from "@mui/icons-material";
import {
    Divider,
    Drawer as MuiDrawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    styled,
    Theme,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    availableFactionUpgrades,
    defaultFactionAbilities,
    factionResources,
    getDefaultFactionAbilityValue,
    participantTagResources,
    technologyResources,
} from "logic/participant";
import { ParticipantInput, ParticipantRole } from "model/calculation";
import {
    Faction,
    FactionAbility,
    FactionResources,
    FactionUpgrade,
    ParticipantTag,
    ParticipantTagResources,
    technologies,
    Technology,
} from "model/combatTags";
import { selectParticipant, setFaction, setParticipantTag, unsetParticipantTag } from "redux/participant/participantSlice";
import { SelectFactionDialog } from "./dialog/SelectFactionDialog";
import { FactionImage } from "./graphics/FactionImage";
import { TechnologyTypeImage } from "./graphics/TechnologyTypeImage";

interface Props {
    location: "left" | "right";
    role: ParticipantRole;
}

export function ParticipantTagEditor(props: Props) {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => setOpen(!open);
    return (
        <Drawer variant="permanent" open={open} anchor={props.location}>
            <ListItem button onClick={toggleDrawer} sx={{ justifyContent: props.location === "right" ? "left" : "right" }}>
                {(props.location === "right") !== open ? <ChevronLeft fontSize="large" /> : <ChevronRight fontSize="large" />}
            </ListItem>
            <Divider />
            <DrawerContent {...props} open={open} />
        </Drawer>
    );
}

interface DrawerContentProps extends Props {
    open: boolean;
}

function DrawerContent({ location, role, open }: DrawerContentProps) {
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
                <ListItem button disableRipple onClick={openFactionDialog}>
                    <ListItemIcon>
                        <FactionImage faction={participant.faction} style={{ width: "30px", marginLeft: "auto", marginRight: "auto" }} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            {faction.name}
                        </Typography>
                    </ListItemText>
                </ListItem>
                {factionAbilities.map((tag: FactionAbility) => (
                    <ParticipantTagListItem
                        key={tag}
                        tag={tag}
                        icon={<TagStarIcon tag={tag} selected={participant.tags[tag] !== undefined} />}
                        selected={participant.tags[tag] !== undefined}
                        tooltip={!open}
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
                                tooltip={!open}
                                selected={participant.tags[tag] !== undefined}
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
                        tooltip={!open}
                        selected={participant.tags[tag] !== undefined}
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

interface ParticipantTagListItemProps {
    tag: ParticipantTag;
    icon?: JSX.Element;
    selected: boolean;
    tooltip?: boolean;
    onToggle: (key: ParticipantTag) => void;
}

function ParticipantTagListItem({ tag, icon, selected, tooltip, onToggle }: ParticipantTagListItemProps) {
    const tagResources: ParticipantTagResources = participantTagResources[tag];

    const listItem: JSX.Element = (
        <ListItem button disabled={!tagResources.implementation} disableRipple onClick={() => onToggle(tag)}>
            {!!icon && <ListItemIcon>{icon}</ListItemIcon>}
            <ListItemText>
                <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(tagResources.implementation ? "" : "[NYI] ") + participantTagResources[tag].name}
                </Typography>
            </ListItemText>
            {!!tagResources.implementation && <ListItemIcon>{selected ? <CheckBox /> : <CheckBoxOutlineBlank />}</ListItemIcon>}
        </ListItem>
    );

    if (tooltip) {
        return (
            <Tooltip title={tagResources.name} placement="right">
                {listItem}
            </Tooltip>
        );
    } else {
        return listItem;
    }
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
            }}
        />
    );
}

function TechnologyIcon({ tag, selected }: { tag: Technology; selected: boolean }) {
    return (
        <TechnologyTypeImage
            technologyType={technologyResources[tag].type}
            style={{ width: 30, marginLeft: "auto", marginRight: "auto", filter: selected ? undefined : "grayscale(0.8)" }}
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
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});
