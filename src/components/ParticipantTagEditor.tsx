import { CheckBox, CheckBoxOutlineBlank, ChevronLeft, ChevronRight, Person } from "@mui/icons-material";
import {
    Divider,
    Drawer as MuiDrawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    styled,
    Theme,
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

interface Props {
    location: "left" | "right";
    role: ParticipantRole;
}

export function ParticipantTagEditor(props: Props) {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => setOpen(!open);
    return (
        <Drawer variant="permanent" open={open} anchor={props.location}>
            <DrawerHeader sx={{ flexDirection: props.location === "right" ? "row-reverse" : "row" }}>
                <IconButton onClick={toggleDrawer}>{(props.location === "right") !== open ? <ChevronLeft /> : <ChevronRight />}</IconButton>
            </DrawerHeader>
            <Divider />
            {open ? <DrawerOpenContent {...props} /> : <DrawerClosedContent {...props} />}
        </Drawer>
    );
}

function DrawerOpenContent({ location, role }: Props) {
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
                <ListItem>
                    <ListItemText>Faction</ListItemText>
                </ListItem>
                <ListItem button disableRipple onClick={openFactionDialog}>
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis", color: faction.color }}>
                            {faction.name}
                        </Typography>
                    </ListItemText>
                </ListItem>
                {factionAbilities.map((tag: FactionAbility) => (
                    <ParticipantTagListItem
                        key={tag}
                        tag={tag}
                        onToggle={toggleParticipantTag(tag)}
                        selected={participant.tags[tag] !== undefined}
                    />
                ))}
                {factionUpgrades.length > 0 && (
                    <>
                        <ListItem>
                            <ListItemText>Faction upgrades</ListItemText>
                        </ListItem>
                        {factionUpgrades.map((tag: FactionUpgrade) => (
                            <ParticipantTagListItem
                                key={tag}
                                tag={tag}
                                onToggle={toggleParticipantTag(tag)}
                                selected={participant.tags[tag] !== undefined}
                            />
                        ))}
                    </>
                )}
                <ListItem>
                    <ListItemText>Technologies</ListItemText>
                </ListItem>
                {technologies.map((tag: Technology) => (
                    <ParticipantTagListItem
                        key={tag}
                        tag={tag}
                        onToggle={toggleParticipantTag(tag)}
                        selected={participant.tags[tag] !== undefined}
                    />
                ))}
                <Divider />
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
    selected: boolean;
    onToggle: (key: ParticipantTag) => void;
}

function ParticipantTagListItem(props: ParticipantTagListItemProps) {
    const { tag, selected, onToggle } = props;

    const tagResources: ParticipantTagResources = participantTagResources[tag];

    if (!tagResources.implemented) {
        return (
            <ListItem>
                <ListItemText>
                    <Typography
                        variant="body1"
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", color: participantTagResources[tag].color }}
                    >
                        {"[NYI] " + participantTagResources[tag].name}
                    </Typography>
                </ListItemText>
            </ListItem>
        );
    }

    return (
        <ListItem button disableRipple onClick={() => onToggle(tag)}>
            <ListItemText>
                <Typography
                    variant="body1"
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", color: participantTagResources[tag].color }}
                >
                    {participantTagResources[tag].name}
                </Typography>
            </ListItemText>
            <ListItemIcon>{selected ? <CheckBox /> : <CheckBoxOutlineBlank />}</ListItemIcon>
        </ListItem>
    );
}

function DrawerClosedContent({ location, role }: Props) {
    return <List></List>;
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

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(1, 2),
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
