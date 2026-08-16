import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { ScientistImage } from "components/graphics";
import { ParticipantRole, RichUnit } from "model/calculation";
import { UnitTag } from "model/combatTags";
import { UnitType } from "model/unit";
import { setUnitTag, unsetUnitTag } from "redux/participant/participantSlice";
import { AppDispatch } from "redux/store";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitScientistInput({ role, unit }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    if (unit.input.type !== UnitType.PDS) return null;

    const hasScientist: boolean = !!unit.input.tags && unit.input.tags[UnitTag.SCIENTIST] === true;

    const toggleScientist = () => {
        if (hasScientist) {
            dispatch(
                unsetUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.SCIENTIST,
                }),
            );
        } else {
            dispatch(
                setUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.SCIENTIST,
                    value: true,
                }),
            );
        }
    };
    return (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                Scientist
            </Typography>
            <Tooltip title="A scientist is present with the unit" placement="right">
                <IconButton size="small" onClick={toggleScientist}>
                    <ScientistImage
                        style={{
                            width: 20,
                            height: 20,
                            filter: hasScientist ? undefined : "grayscale(0.8)",
                            opacity: hasScientist ? undefined : "0.7",
                            borderRadius: "50%",
                            borderStyle: "solid",
                            borderWidth: "2px",
                            borderColor: hasScientist ? "#DDDDDD" : "transparent",
                        }}
                    />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
