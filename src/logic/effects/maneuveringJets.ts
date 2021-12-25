import { CombatStage } from "model/calculation";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.SpaceCannon];

/**
 * NYI:
 * * Space mines
 * * -2 if firing from an adjacent system
 */
export const maneuveringJets: ParticipantTagImplementation = {
    onComputeOpponentUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (applicableCombatStages.includes(stage)) {
            for (let unit of units) {
                unit.combatValue++;
            }
        }
    },
};
