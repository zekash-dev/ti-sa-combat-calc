import { Add, Delete, Remove } from "@mui/icons-material";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { Participant, ParticipantRole, UnitType } from "model/common";
import {
    clearParticipantUnitsOfType,
    decrementUnitCount,
    incrementUnitCount,
    selectParticipant,
    setUnitCount,
} from "redux/participant/participantSlice";
import { isInteger } from "lodash";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const participant: Participant = useSelector(selectParticipant(role));

    const handleDecrementUnitCount = (unit: UnitType) => dispatch(decrementUnitCount({ role, unit }));
    const handleIncrementUnitCount = (unit: UnitType) => dispatch(incrementUnitCount({ role, unit }));
    const handleSetUnitCount = (unit: UnitType, count: string) => {
        const convertedCount: number = Number(count);
        if (isInteger(convertedCount)) {
            dispatch(setUnitCount({ role, unit, count: convertedCount }));
        }
    };
    const handleClearUnitCount = (unit: UnitType) => dispatch(clearParticipantUnitsOfType({ role, unit }));

    return (
        <Box sx={{ width: 400, p: 4 }}>
            <h2>{role}</h2>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Unit</TableCell>
                            <TableCell>Count</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(UnitType).map((unitType) => {
                            const count: number = participant.units[unitType] ?? 0;
                            return (
                                <TableRow key={unitType}>
                                    <TableCell>{unitType}</TableCell>
                                    <TableCell>
                                        {/* <IconButton size="small" disabled={count === 0} onClick={() => handleDecrementUnitCount(unitType)}>
                                            <Remove />
                                        </IconButton> */}
                                        <TextField
                                            type="number"
                                            size="small"
                                            sx={{ width: 80 }}
                                            value={count}
                                            onChange={(e) => handleSetUnitCount(unitType, e.target.value)}
                                        />
                                        {/* <IconButton size="small" onClick={() => handleIncrementUnitCount(unitType)}>
                                            <Add />
                                        </IconButton> */}
                                    </TableCell>
                                    <TableCell sx={{ width: 34 }}>
                                        {count > 0 && (
                                            <IconButton size="small" onClick={() => handleClearUnitCount(unitType)}>
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
