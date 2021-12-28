import { CombatStage, CombatType, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.GroundForce, UnitType.ShockTroop, UnitType.Mech];

/**
 * NYI: reroll 2 dice each combat round
 */
export const general: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, units }: ParticipantOnComputeSnapshotInput) => {
        if (calculationInput.combatType === CombatType.InvasionCombat) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
                unit.combatValue--;
            }
        }
    },
    onComputeOpponentUnitSnapshots: ({ role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // 'role' here indicates the role of the effect owner
        if (role === ParticipantRole.Defender && stage === CombatStage.Bombardment) {
            for (let unit of units) {
                unit.combatValue += 3;
            }
        }
    },
};
