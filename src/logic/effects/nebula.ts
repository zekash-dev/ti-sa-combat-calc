import { CombatType, duringSpaceBattlesStages, ParticipantRole } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const nebula: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, stage, role, units }: ParticipantOnComputeSnapshotInput) => {
        if (
            calculationInput.combatType === CombatType.SpaceBattle &&
            role === ParticipantRole.Defender &&
            duringSpaceBattlesStages.includes(stage)
        ) {
            for (let unit of units) {
                unit.combatValue--;
            }
        }
    },
};
