import { Box, Typography } from "@mui/material";

import { combatStageResources, flagshipDefinitions } from "logic/participant";
import { CombatStage, ParticipantRole, RichUnit } from "model/calculation";
import { Faction } from "model/combatTags";
import { FlagshipDefinition, unitDefinitions, UnitType } from "model/unit";
import { UnitAdmiralInput } from "./UnitAdmiralInput";
import { UnitKeepAliveInput } from "./UnitKeepAliveInput";
import { UnitScientistInput } from "./UnitScientistInput";
import { UnitStageStatsView } from "./UnitStageStatsView";
import { UnitSustainDamageInput } from "./UnitSustainDamageInput";
import { UnitCombatValueModInput } from "./UnitCombatValueModInput";
import { UnitCombatRollsModInput } from "./UnitCombatRollsModInput";

interface Props {
    unit: RichUnit;
    faction: Faction;
    role: ParticipantRole;
}

export function UnitPopover({ unit, faction, role }: Props) {
    const flagshipDefinition: FlagshipDefinition | undefined =
        unit.input.type === UnitType.Flagship ? flagshipDefinitions[faction] : undefined;
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {unitDefinitions[unit.input.type].name}
            </Typography>
            {flagshipDefinition && (
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {flagshipDefinition.flagshipName}
                </Typography>
            )}
            {Object.keys(unit.byStage).map((stageKey: string) => {
                const stage: CombatStage = Number(stageKey);
                return <UnitStageStatsView key={stage} label={combatStageResources[stage].shortName} stats={unit.byStage[stage]!} />;
            })}
            {unit.baseline && <UnitStageStatsView label="Combat" stats={unit.baseline} />}
            <UnitAdmiralInput role={role} unit={unit} />
            <UnitScientistInput role={role} unit={unit} />
            <UnitSustainDamageInput role={role} unit={unit} />
            <UnitKeepAliveInput role={role} unit={unit} />
            <UnitCombatValueModInput role={role} unit={unit} />
            <UnitCombatRollsModInput role={role} unit={unit} />
            {flagshipDefinition?.notes && (
                <Typography
                    variant="body2"
                    sx={{
                        fontStyle: "italic",
                        color: (theme) => (flagshipDefinition.nyi ? theme.palette.text.secondary : theme.palette.text.primary),
                    }}
                >
                    {flagshipDefinition.nyi && "[NYI] "}
                    {flagshipDefinition.notes}
                </Typography>
            )}
        </Box>
    );
}
