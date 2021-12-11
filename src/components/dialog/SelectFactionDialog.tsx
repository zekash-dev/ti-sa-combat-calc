import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";

import { getAllEnumValues } from "logic/common";
import { factionResources } from "logic/participant";
import { Faction } from "model/combatTags";

interface Props {
    open: boolean;
    currentValue: Faction;
    onClose: () => void;
    onSelect: (newValue: Faction) => void;
}

export function SelectFactionDialog({ open, currentValue, onClose, onSelect }: Props) {
    const handleSelectFaction = (newValue: Faction) => () => {
        onSelect(newValue);
        onClose();
    };
    return (
        <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
            <DialogTitle sx={{ textAlign: "center" }}>Select faction</DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    {getAllEnumValues<Faction>(Faction).map((faction: Faction) => (
                        <Grid key={faction} item xs={4}>
                            <Button
                                variant="contained"
                                // color={faction === currentValue ? "secondary" : "primary"}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: factionResources[faction].color,
                                    border: faction === currentValue ? "5px solid white" : "5px solid transparent",
                                    fontSize: "1.1em",
                                }}
                                onClick={handleSelectFaction(faction)}
                            >
                                {factionResources[faction].name}
                            </Button>
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
