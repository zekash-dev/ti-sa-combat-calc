import { Box, IconButton, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { HitCounterImage } from "components/graphics";
import { ParticipantRole, RichUnit } from "model/calculation";
import { setUnitSustainedHits } from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitSustainDamageInput({ role, unit }: Props) {
    const dispatch = useDispatch();
    const sustainDamage: number = unit.baseline?.sustainDamage ?? 0;
    const sustainedHits: number = unit.input.sustainedHits;

    const setSustainedHits = (sustainedHits: number) => () => {
        dispatch(
            setUnitSustainedHits({
                role: role,
                unitIndex: unit.unitIndex,
                sustainedHits,
            })
        );
    };

    const buttons: JSX.Element[] = [];
    for (let i = 0; i < sustainDamage; i++) {
        const isSustained: boolean = i < sustainedHits;
        const nextValue: number = i + 1 === sustainedHits ? i : i + 1;
        buttons.push(
            <IconButton key={`hit-${i}-${nextValue}`} size="small" onClick={setSustainedHits(nextValue)}>
                <HitCounterImage
                    style={{
                        width: 20,
                        height: 20,
                        filter: isSustained ? undefined : "grayscale(0.8)",
                        opacity: isSustained ? undefined : "0.7",
                    }}
                />
            </IconButton>
        );
    }

    return buttons.length ? (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                Sustain
            </Typography>
            {buttons}
        </Box>
    ) : null;
}
