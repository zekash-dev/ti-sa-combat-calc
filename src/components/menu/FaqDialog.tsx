import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { Paragraph, Subheading } from "./Common";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function FaqDialog({ open, onClose }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle color="text.primary">FAQ</DialogTitle>
            <OverlayScrollbarsComponent>
                <DialogContent>
                    <Subheading first>What is a Draw?</Subheading>
                    <Paragraph>
                        If the combat ends in a draw, it means that all units from both the attacker and defender have been destroyed. Total
                        destruction!
                    </Paragraph>
                    <Subheading>Expected and assigned hits</Subheading>
                    <Paragraph>
                        For each combat stage, the number of expected hits for each participant is printed. Expected hits are an average of
                        all possible outcomes at the beginning of the stage, weighed by probability. Combat outcomes that end before the
                        stage in question are excluded from the average.
                    </Paragraph>
                    <Paragraph>
                        <b>Example:</b> 3 fighters would by default grant 0.6 expected hits in round 1. If the opponent has expected hits in
                        the AFB stage, the expected hits of the fighters will go down in round 1 (because some fighters are likely to be
                        destroyed). However, the expected hits will not drop below 0.2, since expected hits are only calculated for outcomes
                        where at least 1 fighter survives the AFB stage.
                    </Paragraph>
                    <Paragraph>
                        In some cases, the expected hits will differ from the number of actual assigned hits. This is usually due to
                        "oversaturation" of hits (i.e. all hits can't be assigned). In these cases, both expected and assigned hits will be
                        displayed.
                    </Paragraph>
                    <Paragraph>
                        Effects such as Impulsion shields and Berzerker genome can also cause the expected hits and assigned hits to differ.
                    </Paragraph>
                    <Subheading>Hit assignment priority</Subheading>
                    <Paragraph>
                        Currently, hit assignment priority works as follows:
                        <ol>
                            <li>Assign hits to units that can sustain damage</li>
                            <li>Assign hits to the unit with the worst combat value (except units with "Keep alive" set)</li>
                            <li>Assign hits to units with "Keep alive" set that can't sustain more hits</li>
                        </ol>
                        The plan is to implement some ways for the user to modify this priority, such as prioritizing by unit resource
                        value. Suggestions for other hit assignment rules are welcome.
                    </Paragraph>
                </DialogContent>
            </OverlayScrollbarsComponent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
