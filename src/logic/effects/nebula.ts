import { CombatType, ParticipantRole } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const nebula: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, units }: ParticipantOnComputeSnapshotInput) => {
        if (calculationInput.combatType === CombatType.SpaceBattle && role === ParticipantRole.Defender) {
            for (let unit of units) {
                unit.combatValue--;
            }
        }
    },
};
