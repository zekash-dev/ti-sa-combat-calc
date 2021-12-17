import { CombatStage, ParticipantRole } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const xxchaRound1Mod: ParticipantTagImplementation = {
    onComputeOpponentUnitSnapshots: ({ role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // 'role' here indicates the xxcha's own role
        if (role === ParticipantRole.Defender && stage === CombatStage.Round1) {
            for (let unit of units) {
                unit.combatValue++;
            }
        }
    },
};
