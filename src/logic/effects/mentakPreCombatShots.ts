import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.Destroyer, UnitType.Cruiser];

export const mentakPreCombatShots: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage !== CombatStage.PreCombat) return;

        let grantedShots = 0;
        for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type)).sort(unitCombatStrengthComparer)) {
            if (++grantedShots > 2) break;
            unit.rolls++;
        }
    },
};

function unitCombatStrengthComparer(a: ComputedUnitSnapshot, b: ComputedUnitSnapshot): number {
    return a.combatValue - b.combatValue;
}
