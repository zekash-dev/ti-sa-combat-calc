import { Favorite } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { useDispatch } from "react-redux";

import { ParticipantRole, RichUnit } from "model/calculation";
import { UnitTag } from "model/combatTags";
import { setUnitTag, unsetUnitTag } from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitKeepAliveInput({ role, unit }: Props) {
    const dispatch = useDispatch();

    const hasKeepAlive: boolean = !!unit.input.tags && unit.input.tags[UnitTag.KEEP_ALIVE] === true;

    const toggleKeepAlive = () => {
        if (hasKeepAlive) {
            dispatch(
                unsetUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.KEEP_ALIVE,
                })
            );
        } else {
            dispatch(
                setUnitTag({
                    role: role,
                    unitIndex: unit.unitIndex,
                    tag: UnitTag.KEEP_ALIVE,
                    value: true,
                })
            );
        }
    };
    return (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                Keep alive
            </Typography>
            <IconButton size="small" onClick={toggleKeepAlive}>
                <Favorite
                    color="error"
                    style={{
                        width: 20,
                        height: 20,
                        filter: hasKeepAlive ? undefined : "grayscale(0.8)",
                        opacity: hasKeepAlive ? undefined : "0.7",
                    }}
                />
            </IconButton>
        </Box>
    );
}
