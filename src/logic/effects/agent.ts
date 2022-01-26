import { CombatStage, ParticipantRole } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export const agent: ParticipantTagImplementation = {
    onComputeOpponentUnitSnapshots: ({ combatState, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // 'role' here indicates the agent owner's role
        if (role === ParticipantRole.Attacker && stage === CombatStage.InvasionDefence) {
            for (let unit of units) {
                // Setting this to NaN prevents any other effects from adding more combat rolls for the unit.
                // NaN will be changed to 0 after all tags are applied.
                unit.rolls = NaN;
            }
        }
    },
};
