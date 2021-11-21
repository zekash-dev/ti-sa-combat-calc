import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { Participant, ParticipantRole, UnitType } from "model/common";
import { decrementUnitCount, incrementUnitCount, selectParticipant } from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const participant: Participant = useSelector(selectParticipant(role));

    const handleDecrementUnitCount = (unit: UnitType) => dispatch(decrementUnitCount({ role, unit }));

    const handleIncrementUnitCount = (unit: UnitType) => dispatch(incrementUnitCount({ role, unit }));

    return (
        <Box sx={{ width: 400, p: 4 }}>
            <h2>{role}</h2>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Unit</TableCell>
                            <TableCell>Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(UnitType).map((unitType) => {
                            const count: number = participant.units[unitType] ?? 0;
                            return (
                                <TableRow>
                                    <TableCell>{unitType}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" disabled={count === 0} onClick={() => handleDecrementUnitCount(unitType)}>
                                            <Remove />
                                        </IconButton>
                                        <span>{count}</span>
                                        <IconButton size="small" onClick={() => handleIncrementUnitCount(unitType)}>
                                            <Add />
                                        </IconButton>
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
