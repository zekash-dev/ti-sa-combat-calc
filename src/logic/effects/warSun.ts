import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const warSun: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.Bombardment) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.WarSun)) {
                unit.rolls += 2;
            }
        }
    },
};
