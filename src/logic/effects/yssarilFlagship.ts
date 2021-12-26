import { CombatStage } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.SpaceMines, CombatStage.SpaceCannon];

export const yssarilFlagship: ParticipantTagImplementation = {
    preAssignHits: ({ combatState }: PreAssignHitsInput): PreAssignHitsOutput => {
        if (applicableCombatStages.includes(combatState.stage)) {
            return { newHits: {} };
        }
        return {};
    },
};
