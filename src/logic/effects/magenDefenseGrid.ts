import { CombatStage, CombatType, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableGroundUnitTypes: UnitType[] = [UnitType.Mech, UnitType.GroundForce, UnitType.ShockTroop];

/**
 * NYI:
 * * +1 to PDS in Invasion Defense stage
 * * Use Planetary Shield to cancel hits in invasion combat.
 */
export const magenDefenseGrid: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.SpaceCannon) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.PDS)) {
                unit.combatValue--;
            }
        }
        if (calculationInput.combatType === CombatType.InvasionCombat && role === ParticipantRole.Defender) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableGroundUnitTypes.includes(u.type))) {
                unit.combatValue--;
            }
        }
    },
};
