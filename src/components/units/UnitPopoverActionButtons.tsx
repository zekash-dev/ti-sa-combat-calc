import { ContentCopy, Delete, Replay } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";

import { ParticipantRole, RichUnit } from "model/calculation";
import { createUnitDuplicate, removeUnit, resetUnitModifications } from "redux/participant/participantSlice";
import { useCallback } from "react";

interface Props {
    role: ParticipantRole;
    unit: RichUnit;
}

export function UnitPopoverActionButtons({ role, unit }: Props) {
    const dispatch = useDispatch();

    const hasModifications = unit.input.sustainedHits > 0 || (unit.input.tags !== undefined && Object.keys(unit.input.tags).length > 0);

    const handleCreateDuplicate = useCallback(() => {
        dispatch(createUnitDuplicate({ role: role, unitIndex: unit.unitIndex }));
    }, [dispatch, role, unit.unitIndex]);

    const handleRemove = useCallback(() => {
        dispatch(removeUnit({ role: role, unitIndex: unit.unitIndex }));
    }, [dispatch, role, unit.unitIndex]);

    const handleResetUnit = useCallback(() => {
        dispatch(resetUnitModifications({ role: role, unitIndex: unit.unitIndex }));
    }, [dispatch, role, unit.unitIndex]);

    return (
        <Box>
            <Tooltip title="Create a copy of this unit">
                <IconButton size="small" onClick={handleCreateDuplicate}>
                    <ContentCopy sx={{ width: 20, height: 20 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Reset all unit modifications">
                <span>
                    <IconButton size="small" onClick={handleResetUnit} disabled={!hasModifications}>
                        <Replay sx={{ width: 20, height: 20 }} />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Remove unit">
                <IconButton size="small" onClick={handleRemove}>
                    <Delete color="error" sx={{ width: 20, height: 20 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
