import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

/**
 * NYI: Fire through asteroids with -1 to hit
 */
export const gravitonLaserSystem: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage !== CombatStage.SpaceCannon) return;

        for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.PDS)) {
            unit.rolls++;
            break;
        }
    },
};
