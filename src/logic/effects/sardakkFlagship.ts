import { CombatStage, CombatType, ParticipantRole } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

const applicableCombatStages: CombatStage[] = [
    CombatStage.StartOfBattle,
    CombatStage.AntiFighterBarrage,
    CombatStage.PreCombat,
    CombatStage.Round1,
    CombatStage.Round2,
    CombatStage.RoundN,
];

export const sardakkFlagship: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (
            calculationInput.combatType === CombatType.SpaceBattle &&
            role === ParticipantRole.Attacker &&
            applicableCombatStages.includes(stage)
        ) {
            for (let unit of units) {
                unit.combatValue--;
            }
        }
    },
};
