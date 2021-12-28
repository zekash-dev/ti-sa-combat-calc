import { CombatStage, CombatType } from "model/calculation";
import { UnitOnComputeSnapshotInput, UnitTagImplementation } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export const admiral: UnitTagImplementation = {
    onComputeUnitSnapshot: ({ calculationInput, stage, unit }: UnitOnComputeSnapshotInput) => {
        if (calculationInput.combatType === CombatType.SpaceBattle && applicableCombatStages.includes(stage)) {
            unit.rolls++;
        }
    },
};
