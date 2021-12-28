import { ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.GroundForce, UnitType.ShockTroop];

export const lizixGroundForceMod: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ role, units }: ParticipantOnComputeSnapshotInput) => {
        let bonus = 1;
        if (role === ParticipantRole.Attacker && units.some((u) => u.type === UnitType.Mech)) {
            bonus = 2;
        }
        for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
            unit.combatValue -= bonus;
        }
    },
};
