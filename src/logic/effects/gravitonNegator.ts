import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { Technology } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnits: UnitType[] = [UnitType.Cruiser, UnitType.Fighter];

export const gravitonNegator: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.Bombardment) {
            const hasHylar: boolean = calculationInput[role].tags[Technology.HYLAR_V_LASER] !== undefined;

            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnits.includes(u.type))) {
                unit.rolls++;
                // If you have Hylar, do not grant the +1 bonus to Cruisers
                if (!hasHylar || unit.type !== UnitType.Cruiser) {
                    unit.combatValue -= 1;
                }
            }
        }
    },
};
