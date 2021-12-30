import { Favorite, PriorityHigh } from "@mui/icons-material";
import { Popover, Tooltip } from "@mui/material";
import React, { useState } from "react";

import { AdmiralImage, HitCounterImage, ScientistImage, UnitImage } from "components/graphics";
import { flagshipDefinitions } from "logic/participant";
import { ParticipantRole, RichUnit } from "model/calculation";
import { Faction, UnitTag } from "model/combatTags";
import { unitDefinitions, UnitType } from "model/unit";
import { UnitPopover } from "./UnitPopover";

interface Props {
    unit: RichUnit;
    faction: Faction;
    role: ParticipantRole;
    scale: number;
}

export function UnitBattlefieldRepresentation({ unit, faction, role, scale }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const hasAdmiral: boolean = !!unit.input.tags && unit.input.tags[UnitTag.ADMIRAL] === true;
    const hasScientist: boolean = !!unit.input.tags && unit.input.tags[UnitTag.SCIENTIST] === true;
    const keepAlive: boolean = !!unit.input.tags && unit.input.tags[UnitTag.KEEP_ALIVE] === true;

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
                style={{
                    display: "inline-block",
                    cursor: "pointer",
                    margin: 1,
                    height: unitDefinitions[unit.input.type].imageSize.y * scale,
                    width: unitDefinitions[unit.input.type].imageSize.x * scale,
                    float: role === ParticipantRole.Attacker ? "right" : "left",
                }}
            >
                <UnitImage
                    unitType={unit.input.type}
                    faction={faction}
                    role={role}
                    scale={scale}
                    badges={[
                        unit.input.type === UnitType.Flagship && flagshipDefinitions[faction].nyi === true && (
                            <Tooltip title="Flagship effect not yet implemented">
                                <PriorityHigh color="error" />
                            </Tooltip>
                        ),
                        hasAdmiral && <AdmiralImage key="admiral" />,
                        hasScientist && <ScientistImage key="scientist" />,
                        keepAlive && <Favorite color="error" />,
                        ...[...Array(unit.input.sustainedHits)].map((v, idx) => <HitCounterImage key={`hit-${idx}`} />),
                    ]}
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
                <UnitPopover unit={unit} faction={faction} role={role} />
            </Popover>
        </>
    );
}
