import { Box, Popover, Typography } from "@mui/material";
import React, { useState } from "react";

import { ParticipantRole, UnitInput } from "model/calculation";
import { Faction } from "model/combatTags";
import { unitDefinitions } from "model/unit";
import { CombatRollImage } from "./graphics/CombatRollImage";
import { UnitImage } from "./graphics/UnitImage";

interface Props {
    unit: UnitInput;
    faction: Faction;
    role: ParticipantRole;
    scale: number;
}

export function UnitBattlefieldRepresentation({ unit, faction, role, scale }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const openPopover = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    return (
        <>
            <div
                onClick={openPopover}
                // onMouseOut={closePopover}
                style={{
                    display: "inline-block",
                    cursor: "pointer",
                    margin: 1,
                    height: unitDefinitions[unit.type].imageHeight * scale,
                    width: unitDefinitions[unit.type].imageWidth * scale,
                    float: role === ParticipantRole.Attacker ? "right" : "left",
                }}
            >
                <UnitImage
                    unitType={unit.type}
                    faction={faction}
                    role={role}
                    width={unitDefinitions[unit.type].imageWidth * scale}
                    height={unitDefinitions[unit.type].imageHeight * scale}
                />
            </div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "left",
                }}
            >
                <UnitPopover unit={unit} />
            </Popover>
        </>
    );
}

interface UnitPopoverProps {
    unit: UnitInput;
}

function UnitPopover({ unit }: UnitPopoverProps) {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", paddingBottom: 1 }}>
                {unitDefinitions[unit.type].name}
            </Typography>
            {[...Array(unitDefinitions[unit.type].combatRolls)].map((x, i) => (
                <CombatRollImage combatValue={unitDefinitions[unit.type].combatValue} width={24} height={24} />
            ))}
        </Box>
    );
}
