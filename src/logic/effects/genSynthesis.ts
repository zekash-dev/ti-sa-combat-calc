import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.GroundForce, UnitType.ShockTroop];

export const genSynthesis: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
            unit.combatValue--;
        }
    },
};
