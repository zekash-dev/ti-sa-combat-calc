import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { ImageLink, Paragraph } from "./Common";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function AboutDialog({ open, onClose }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Typography variant="h4" color="text.primary">
                    About
                </Typography>
            </DialogTitle>
            <OverlayScrollbarsComponent>
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
                    <Paragraph sx={{ marginTop: 4 }}>Made by Zekash.</Paragraph>
                </DialogContent>
            </OverlayScrollbarsComponent>
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
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
