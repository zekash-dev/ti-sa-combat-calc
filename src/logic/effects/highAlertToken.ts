import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const highAlertToken: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (let unit of units) {
            unit.combatValue--;
        }
    },
};
