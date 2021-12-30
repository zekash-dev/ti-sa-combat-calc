import { HitType } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const lizixFlagship: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Flagship)) {
            unit.hitType = HitType.AssignToNonFighterFirst;
        }
    },
};
