import { Delete } from "@mui/icons-material";
import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { isInteger } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { ParticipantInput, ParticipantRole } from "model/calculation";
import { UnitType } from "model/unit";
import { clearParticipantUnitsOfType, getUnitCount, selectParticipant, setUnitCount } from "redux/participant/participantSlice";
import { UnitImage } from "./graphics/UnitImage";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const participant: ParticipantInput = useSelector(selectParticipant(role));

    const handleSetUnitCount = (unit: UnitType, count: string) => {
        const convertedCount: number = Number(count);
        if (isInteger(convertedCount)) {
            dispatch(setUnitCount({ role, unit, count: convertedCount }));
        }
    };
    const handleClearUnitCount = (unit: UnitType) => dispatch(clearParticipantUnitsOfType({ role, unit }));

    return (
        <Box sx={{ width: 400, p: 4 }}>
            <Typography variant="h3">{role.toUpperCase()}</Typography>
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
                        {Object.values(UnitType)
                            .filter((v): v is number => typeof v === "number")
                            .map((unitType: number) => {
                                const count: number = getUnitCount(participant, unitType);
                                return (
                                    <TableRow key={unitType}>
                                        <TableCell>{UnitType[unitType]}</TableCell>
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
            <UnitImage unitType={UnitType.Flagship} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.WarSun} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.Dreadnought} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.Cruiser} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.Destroyer} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.Carrier} faction={participant.faction} role={role} />
            <UnitImage unitType={UnitType.Fighter} faction={participant.faction} role={role} />
        </Box>
    );
}
