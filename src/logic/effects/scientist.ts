import { UnitOnComputeSnapshotInput, UnitTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const scientist: UnitTagImplementation = {
    onComputeUnitSnapshot: ({ unit }: UnitOnComputeSnapshotInput) => {
        if (unit.type === UnitType.PDS) {
            unit.planetaryShield++;
            unit.combatValue--;
        }
    },
};
