import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const highAlertToken: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ units }: ParticipantOnComputeSnapshotInput) => {
        for (const unit of units) {
            unit.combatValue--;
        }
    },
};
