import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { Technology } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.Dreadnought, UnitType.Cruiser];

export const assaultCannons: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (stage === CombatStage.PreCombat) {
            const hasHylar: boolean = calculationInput[role].tags[Technology.HYLAR_V_LASER] !== undefined;
            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
                if (hasHylar && unit.type === UnitType.Cruiser) {
                    // Grant a combat roll with a value mod of +1 (i.e. not buffed by Hylar)
                    unit.nonStandardRolls.push({ valueMod: +1 });
                } else {
                    unit.rolls++;
                }
            }
        }
    },
};
