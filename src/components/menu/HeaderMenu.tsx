import { QuestionMark, Settings } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { InfoVariant } from "components/graphics";
import { CombatType } from "model/calculation";
import { selectCombatType, setCombatType } from "redux/participant/participantSlice";
import { AboutDialog } from "./AboutDialog";
import { FaqDialog } from "./FaqDialog";
import { SettingsDialog } from "./SettingsDialog";

type FloatingMenuDialog = "about" | "faq" | "settings";

export function HeaderMenu() {
    const dispatch = useDispatch();
    const combatType: CombatType = useSelector(selectCombatType);
    const [currentDialog, setCurrentDialog] = useState<FloatingMenuDialog | undefined>(undefined);

    const onChangeCombatType = (combatType: CombatType) => () => dispatch(setCombatType(combatType));

    const onOpen = (dialog: FloatingMenuDialog) => () => setCurrentDialog(dialog);
    const onClose = () => setCurrentDialog(undefined);

    return (
        <Grid
            container
            sx={{
                width: "100%",
                padding: "5px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
            }}
        >
            <Grid item xs={3}>
                <Grid container sx={{ justifyContent: "flex-start", alignItems: "center", height: "100%" }}>
                    <Grid item></Grid>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <Grid container sx={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <Grid item>
                        <ButtonGroup>
                            <Button
                                color="primary"
                                variant={combatType === CombatType.SpaceBattle ? "contained" : "outlined"}
                                onClick={onChangeCombatType(CombatType.SpaceBattle)}
                                sx={{ width: "50%", whiteSpace: "nowrap" }}
                            >
                                Space battle
                            </Button>
                            <Button
                                color="primary"
                                variant={combatType === CombatType.InvasionCombat ? "contained" : "outlined"}
                                onClick={onChangeCombatType(CombatType.InvasionCombat)}
                                sx={{ width: "50%", whiteSpace: "nowrap" }}
                            >
                                Invasion combat
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3}>
                <Grid container sx={{ justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                    <Grid item>
                        <Tooltip placement="bottom" title="Settings">
                            <IconButton color="primary" onClick={onOpen("settings")}>
                                <Settings />
                            </IconButton>
                        </Tooltip>
                        <Tooltip placement="bottom" title="FAQ">
                            <IconButton color="primary" onClick={onOpen("faq")}>
                                <QuestionMark />
                            </IconButton>
                        </Tooltip>
                        <Tooltip placement="bottom" title="About">
                            <IconButton color="primary" onClick={onOpen("about")}>
                                <InfoVariant />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
            <SettingsDialog open={currentDialog === "settings"} onClose={onClose} />
            <FaqDialog open={currentDialog === "faq"} onClose={onClose} />
            <AboutDialog open={currentDialog === "about"} onClose={onClose} />
        </Grid>
    );
}
