import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";

import { FactionImage } from "components/graphics";
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
            <DialogTitle sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="text.primary">
                    Select faction
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    {getAllEnumValues<Faction>(Faction).map((faction: Faction) => (
                        <Grid key={faction} item xs={12} sm={6} md={4}>
                            <Button
                                variant="outlined"
                                sx={{
                                    justifyContent: "left",
                                    width: "100%",
                                    height: "80px",
                                    color: factionResources[faction].color,
                                    backgroundColor: faction === currentValue ? "rgba(255, 255, 255, 0.2)" : undefined,
                                    border: `5px solid ${factionResources[faction].color}`,
                                    fontSize: "1.1em",
                                    "&:hover": {
                                        borderWidth: "5px",
                                    },
                                }}
                                onClick={handleSelectFaction(faction)}
                            >
                                <FactionImage faction={faction} style={{ width: "50px" }} />
                                <Typography variant="body1" color="text.primary" sx={{ m: 2 }}>
                                    {factionResources[faction].name}
                                </Typography>
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
