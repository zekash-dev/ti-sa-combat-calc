import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { Technology } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const automatedTurrets: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.AntiFighterBarrage) {
            // No need to use "nonStandardRolls" for this, because the bonus granted to all AFB shots by Automated Turrets
            // is greater than the bonus granted by Hylar V Laser (and therefore supersedes it)
            let bonus = 2;
            if (calculationInput[role].tags[Technology.HYLAR_V_LASER] !== undefined) {
                bonus = 1;
            }
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Destroyer)) {
                unit.rolls++;
                unit.combatValue -= bonus;
            }
        }
    },
};
