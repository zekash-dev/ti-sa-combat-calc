import { CombatStage } from "model/calculation";
import { UnitOnComputeSnapshotInput, UnitTagImplementation } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export const admiral: UnitTagImplementation = {
    onComputeUnitSnapshot: ({ stage, unit }: UnitOnComputeSnapshotInput) => {
        if (applicableCombatStages.includes(stage)) {
            unit.rolls++;
        }
    },
};
