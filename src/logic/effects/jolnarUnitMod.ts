import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const jolnarUnitMod: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units) {
            unit.combatValue++;
        }
    },
};
