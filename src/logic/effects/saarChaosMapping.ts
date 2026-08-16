import { CombatStage } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.PreCombat, CombatStage.AntiFighterBarrage];

export const saarChaosMapping: ParticipantTagImplementation = {
    onComputeOpponentUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (applicableCombatStages.includes(stage)) {
            for (const unit of units) {
                unit.combatValue++;
            }
        }
    },
};
