import { QuestionMark } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Link, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useState } from "react";

interface Props {
    defenderOpen: boolean;
}

export function AboutMenu({ defenderOpen }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <div
            style={{
                position: "absolute",
                bottom: 16,
                right: defenderOpen ? 356 : 72,
                transition: "right 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
            }}
        >
            <Fab color="primary" onClick={() => setOpen(true)}>
                <QuestionMark />
            </Fab>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
                <DialogTitle>
                    <Typography variant="h4" color="text.primary">
                        About
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Paragraph>
                        This is a combat calculator for{" "}
                        <Link href="http://www.astralvault.net/games/SA/" target="_blank">
                            Twilight Imperium: Shattered Ascension
                        </Link>
                        .
                    </Paragraph>
                    <Paragraph>
                        Input faction, units and active effects for the attacker and defender, and the probability that you win will be
                        automatically calculated.
                    </Paragraph>
                    <Paragraph></Paragraph>
                    <Paragraph>
                        The project is still in development, see the feature roadmap on the{" "}
                        <Link href="https://github.com/zekash-dev/ti-sa-combat-calc" target="_blank">
                            Github project page
                        </Link>
                        . Questions, feature requests and issues can be posted either on Github or in the community Discord server.
                    </Paragraph>
                    <Paragraph sx={{ marginTop: 3 }}>Made by Zekash.</Paragraph>
                </DialogContent>
                <DialogActions>
                    <Link
                        href="https://github.com/zekash-dev/ti-sa-combat-calc"
                        target="_blank"
                        title="Github project page"
                        sx={{
                            marginLeft: 2,
                            marginRight: "auto",
                        }}
                    >
                        <ImageLink src={`${window.location.href}/images/GitHub-Mark-Light-64px.png`} alt="Github logo" />
                    </Link>

                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const ImageLink = styled("img")({
    width: 40,
    opacity: 0.1,
    transition: "opacity 0.2s",
    ":hover": {
        opacity: 1.0,
    },
});

const Paragraph = styled(Typography)({
    marginTop: 5,
});
