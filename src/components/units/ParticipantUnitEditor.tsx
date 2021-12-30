import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { IncrementalNumberInput } from "components/common";
import { getSelectableUnitTypes } from "logic/participant";
import { CalculationInput, ParticipantInput, ParticipantRole } from "model/calculation";
import { unitDefinitions, UnitType } from "model/unit";
import { getUnitCount, selectCalculationInput, selectParticipant, setUnitCount } from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const calculationInput: CalculationInput = useSelector(selectCalculationInput);
    const participant: ParticipantInput = useSelector(selectParticipant(role));
    const handleSetUnitCount = (unit: UnitType, count: number) => dispatch(setUnitCount({ role, unit, count }));

    const selectableUnitTypes: UnitType[] = getSelectableUnitTypes(calculationInput, role);

    return (
        <Box sx={{ m: 2, marginTop: 1 }}>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableBody>
                        {selectableUnitTypes.map((unitType: UnitType) => (
                            <UnitCountEditor
                                key={unitType}
                                type={unitType}
                                count={getUnitCount(participant, unitType)}
                                onChange={handleSetUnitCount}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

interface UnitCountEditorProps {
    type: UnitType;
    count: number;
    onChange(type: UnitType, count: number): void;
}

function UnitCountEditor({ type, count, onChange }: UnitCountEditorProps) {
    const handleValueChanged = (newValue: number) => onChange(type, newValue);
    return (
        <TableRow key={type}>
            <TableCell>{unitDefinitions[type].name}</TableCell>
            <TableCell>
                <IncrementalNumberInput value={count} onChange={handleValueChanged} />
            </TableCell>
        </TableRow>
    );
}
