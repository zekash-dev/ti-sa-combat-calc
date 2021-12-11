import { Add, Remove } from "@mui/icons-material";
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { ParticipantInput, ParticipantRole } from "model/calculation";
import { allUnitTypes, unitDefinitions, UnitType } from "model/unit";
import {
    clearParticipantUnits,
    decrementUnitCount,
    getUnitCount,
    incrementUnitCount,
    selectParticipant,
} from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const participant: ParticipantInput = useSelector(selectParticipant(role));

    const handleDecrementUnitCount = (unit: UnitType) => dispatch(decrementUnitCount({ role, unit }));
    const handleIncrementUnitCount = (unit: UnitType) => dispatch(incrementUnitCount({ role, unit }));
    const handleClearAllunits = () => dispatch(clearParticipantUnits(role));

    return (
        <Box sx={{ m: 2 }}>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableBody>
                        {allUnitTypes.map((unitType: UnitType) => {
                            const count: number = getUnitCount(participant, unitType);
                            return (
                                <TableRow key={unitType}>
                                    <TableCell>{unitDefinitions[unitType].name}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" disabled={count === 0} onClick={() => handleDecrementUnitCount(unitType)}>
                                            <Remove />
                                        </IconButton>
                                        {count}
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
            <Box sx={{ m: 1 }}>
                <Button variant="contained" color="primary" onClick={handleClearAllunits}>
                    Clear units
                </Button>
            </Box>
        </Box>
    );
}
