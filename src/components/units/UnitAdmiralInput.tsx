import { Box, IconButton, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { AdmiralImage } from "components/graphics";
import { unitIsCombatant } from "logic/calculator";
import { CombatType, ParticipantRole, RichUnit } from "model/calculation";
import { UnitTag } from "model/combatTags";
import { setUnitTag, unsetUnitTag } from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitAdmiralInput({ role, unit }: Props) {
    const dispatch = useDispatch();
    if (!unitIsCombatant(unit.input.type, CombatType.SpaceBattle)) return null;

    const hasAdmiral: boolean = !!unit.input.tags && unit.input.tags[UnitTag.ADMIRAL] === true;

    const toggleAdmiral = () => {
        if (hasAdmiral) {
            dispatch(
                unsetUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.ADMIRAL,
                })
            );
        } else {
            dispatch(
                setUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.ADMIRAL,
                    value: true,
                })
            );
        }
    };
    return (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                Admiral
            </Typography>
            <IconButton size="small" onClick={toggleAdmiral}>
                <AdmiralImage
                    style={{
                        width: 20,
                        height: 20,
                        filter: hasAdmiral ? undefined : "grayscale(0.8)",
                        opacity: hasAdmiral ? undefined : "0.7",
                        borderRadius: "50%",
                        borderStyle: "solid",
                        borderWidth: "2px",
                        borderColor: hasAdmiral ? "#DDDDDD" : "transparent",
                    }}
                />
            </IconButton>
        </Box>
    );
}
