import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const sardakkUnitMod: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units) {
            unit.combatValue--;
        }
    },
};
