import { CombatStage, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const muaatMagmaObliterator: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, role, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.Bombardment && role === ParticipantRole.Attacker) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.WarSun)) {
                unit.rolls += 2;
                break;
            }
        }
    },
};
