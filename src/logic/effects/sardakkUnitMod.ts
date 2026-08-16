import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const sardakkUnitMod: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (const unit of units) {
            unit.combatValue--;
        }
    },
};
