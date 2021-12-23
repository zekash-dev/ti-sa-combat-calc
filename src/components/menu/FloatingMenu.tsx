import { QuestionMark, Settings } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

import { InfoVariant } from "components/graphics";
import { AboutDialog } from "./AboutDialog";
import { FaqDialog } from "./FaqDialog";
import { SettingsDialog } from "./SettingsDialog";

type FloatingMenuDialog = "about" | "faq" | "settings";

interface Props {
    defenderOpen: boolean;
}

export function FloatingMenu({ defenderOpen }: Props) {
    const [currentDialog, setCurrentDialog] = useState<FloatingMenuDialog | undefined>(undefined);

    const onOpen = (dialog: FloatingMenuDialog) => () => setCurrentDialog(dialog);
    const onClose = () => setCurrentDialog(undefined);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                bottom: 16,
                right: defenderOpen ? 356 : 72,
                transition: "right 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                "& button": {
                    marginTop: 1,
                },
            }}
        >
            <Fab color="primary" onClick={onOpen("settings")}>
                <Settings />
            </Fab>
            <Fab color="primary" onClick={onOpen("faq")}>
                <QuestionMark />
            </Fab>
            <Fab color="primary" onClick={onOpen("about")}>
                <InfoVariant />
            </Fab>
            <SettingsDialog open={currentDialog === "settings"} onClose={onClose} />
            <FaqDialog open={currentDialog === "faq"} onClose={onClose} />
            <AboutDialog open={currentDialog === "about"} onClose={onClose} />
        </Box>
    );
}
