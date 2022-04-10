import { Popover } from "@mui/material";
import React, { useState } from "react";

import { ParticipantRole, RichUnit } from "model/calculation";
import { Faction } from "model/combatTags";
import { UnitInputImage } from "./UnitInputImage";
import { UnitPopover } from "./UnitPopover";

interface Props {
    unit: RichUnit;
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
            <UnitInputImage
                unit={unit.input}
                faction={faction}
                role={role}
                scale={scale}
                style={{
                    cursor: "pointer",
                    float: role === ParticipantRole.Attacker ? "right" : "left",
                }}
                onClick={openPopover}
            />
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
                <UnitPopover unit={unit} faction={faction} role={role} />
            </Popover>
        </>
    );
}
