import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const ionStorm: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.SpaceCannon) {
            for (let unit of units) {
                // Setting this to NaN prevents any other effects from adding more combat rolls for the unit.
                // NaN will be changed to 0 after all tags are applied.
                unit.rolls = NaN;
            }
        }
        for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Fighter)) {
            // Setting this to NaN prevents any other effects from adding more combat rolls for the unit.
            // NaN will be changed to 0 after all tags are applied.
            unit.rolls = NaN;
        }
    },
};
