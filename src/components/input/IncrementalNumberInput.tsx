import { Add, Remove } from "@mui/icons-material";
import { Button, IconButton, TextField } from "@mui/material";
import { isInteger, round } from "lodash";
import { useState } from "react";

interface Props {
    value: number;
    onChange: (newValue: number) => void;
}

export function IncrementalNumberInput({ value, onChange }: Props) {
    const [tempValue, setTempValue] = useState<string | undefined>(undefined);
    const handleDecrementUnitCount = () => onChange(value - 1);
    const handleIncrementUnitCount = () => onChange(value + 1);

    const onButtonClick = () => setTempValue(String(value));

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
            onChange(numberVal);
        }
        setTempValue(undefined);
    };

    if (tempValue !== undefined) {
        return (
            <TextField
                autoFocus
                onFocus={(e) => {
                    e.target.select();
                }}
                size="small"
                sx={{ width: 40, marginLeft: "32px", marginTop: "2px", marginBottom: "1px", marginRight: "32px" }}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={onInputKeyDown}
                inputProps={{
                    style: { paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8, textAlign: "center" },
                }}
                onBlur={onInputBlur}
            />
        );
    } else {
        return (
            <>
                <IconButton size="small" disabled={value === 0} onClick={handleDecrementUnitCount}>
                    <Remove />
                </IconButton>
                <Button
                    variant="text"
                    sx={{ paddingLeft: 1, paddingRight: 1, minWidth: 35, lineHeight: "unset", color: "text.primary" }}
                    onClick={onButtonClick}
                >
                    {value}
                </Button>
                {/* {count} */}
                <IconButton size="small" onClick={handleIncrementUnitCount}>
                    <Add />
                </IconButton>
            </>
        );
    }
}
