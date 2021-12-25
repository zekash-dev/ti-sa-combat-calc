import { Box, Popover, Typography } from "@mui/material";
import React, { useState } from "react";

import { AdmiralImage, CombatRollImage, HitCounterImage, UnitImage } from "components/graphics";
import { combatStageResources } from "logic/participant";
import { CombatStage, ParticipantRole, RichUnit, UnitStageStats } from "model/calculation";
import { Faction, UnitTag } from "model/combatTags";
import { unitDefinitions } from "model/unit";
import { UnitAdmiralInput } from "./UnitAdmiralInput";
import { UnitSustainDamageInput } from "./UnitSustainDamageInput";

interface Props {
    unit: RichUnit;
    faction: Faction;
    role: ParticipantRole;
    scale: number;
}

export function UnitBattlefieldRepresentation({ unit, faction, role, scale }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const hasAdmiral: boolean = !!unit.input.tags && unit.input.tags[UnitTag.ADMIRAL] === true;

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
                        hasAdmiral && <AdmiralImage key="admiral" />,
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
                <UnitPopover role={role} unit={unit} />
            </Popover>
        </>
    );
}

interface UnitPopoverProps {
    role: ParticipantRole;
    unit: RichUnit;
}

function UnitPopover({ role, unit }: UnitPopoverProps) {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", paddingBottom: 1 }}>
                {unitDefinitions[unit.input.type].name}
            </Typography>
            {Object.keys(unit.byStage).map((stageKey: string) => {
                const stage: CombatStage = Number(stageKey);
                return <UnitStageStatsView label={combatStageResources[stage].shortName} stats={unit.byStage[stage]!} />;
            })}
            {unit.baseline && <UnitStageStatsView label="Combat" stats={unit.baseline} />}
            <UnitAdmiralInput role={role} unit={unit} />
            <UnitSustainDamageInput role={role} unit={unit} />
        </Box>
    );
}

interface UnitStageStatsViewProps {
    label: string;
    stats: UnitStageStats;
}

function UnitStageStatsView({ label, stats }: UnitStageStatsViewProps) {
    return (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                {label}
            </Typography>
            {stats.rolls.map((combatValue, idx) => (
                <CombatRollImage
                    key={`${combatValue}-${idx}`}
                    combatValue={combatValue}
                    style={{ width: 20, height: 20, margin: 2, verticalAlign: "middle" }}
                />
            ))}
        </Box>
    );
}
