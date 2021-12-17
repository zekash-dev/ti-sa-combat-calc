import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.Carrier];

export const solMark2AdvancedCarriers: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
            unit.sustainDamage++;
        }
    },
};
