import { Add, Remove } from "@mui/icons-material";
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from "@mui/material";
import { isInteger, round } from "lodash";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getSelectableUnitTypes } from "logic/participant";
import { CalculationInput, CombatType, ParticipantInput, ParticipantRole } from "model/calculation";
import { unitDefinitions, UnitType } from "model/unit";
import {
    clearParticipantUnits,
    getUnitCount,
    selectCalculationInput,
    selectParticipant,
    setUnitCount,
} from "redux/participant/participantSlice";

interface Props {
    role: ParticipantRole;
}

export function ParticipantUnitEditor({ role }: Props) {
    const dispatch = useDispatch();
    const calculationInput: CalculationInput = useSelector(selectCalculationInput);
    const participant: ParticipantInput = useSelector(selectParticipant(role));
    const handleSetUnitCount = (unit: UnitType, count: number) => dispatch(setUnitCount({ role, unit, count }));
    const handleClearAllunits = () => dispatch(clearParticipantUnits(role));

    const selectableUnitTypes: UnitType[] = getSelectableUnitTypes(CombatType.SpaceBattle, calculationInput, role);

    return (
        <Box sx={{ m: 2 }}>
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
            <Box sx={{ m: 1 }} textAlign="center">
                <Button variant="contained" color="primary" onClick={handleClearAllunits} sx={{ width: 200 }}>
                    Clear units
                </Button>
            </Box>
        </Box>
    );
}

interface UnitCountEditorProps {
    type: UnitType;
    count: number;
    onChange(type: UnitType, count: number): void;
}

function UnitCountEditor({ type, count, onChange }: UnitCountEditorProps) {
    const [tempValue, setTempValue] = useState<string | undefined>(undefined);
    const handleDecrementUnitCount = () => onChange(type, count - 1);
    const handleIncrementUnitCount = () => onChange(type, count + 1);

    const onButtonClick = () => setTempValue(String(count));

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            submitNewValue();
        } else if (e.key === "Escape") {
            setTempValue(undefined);
        }
    };

    const onInputBlur = () => submitNewValue();

    const submitNewValue = () => {
        let numberVal: number = Number(tempValue);
        if (!isNaN(numberVal)) {
            if (!isInteger(numberVal)) {
                numberVal = round(numberVal);
            }
            onChange(type, numberVal);
        }
        setTempValue(undefined);
    };

    return (
        <TableRow key={type} sx={{ height: 50 }}>
            <TableCell>{unitDefinitions[type].name}</TableCell>
            <TableCell>
                {tempValue !== undefined ? (
                    <TextField
                        autoFocus
                        onFocus={(e) => {
                            e.target.select();
                        }}
                        size="small"
                        sx={{ width: 40, marginLeft: "34px" }}
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        inputProps={{
                            style: { paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8, textAlign: "center" },
                        }}
                        onBlur={onInputBlur}
                    />
                ) : (
                    <>
                        <IconButton size="small" disabled={count === 0} onClick={handleDecrementUnitCount}>
                            <Remove />
                        </IconButton>
                        <Button
                            variant="text"
                            sx={{ paddingLeft: 1, paddingRight: 1, minWidth: 35, lineHeight: "unset", color: "text.primary" }}
                            onClick={onButtonClick}
                        >
                            {count}
                        </Button>
                        {/* {count} */}
                        <IconButton size="small" onClick={handleIncrementUnitCount}>
                            <Add />
                        </IconButton>
                    </>
                )}
            </TableCell>
        </TableRow>
    );
}
