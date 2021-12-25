import { sum } from "lodash";

import { CombatStage, HitType } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export const sardakkBerzerkerGenome: ParticipantTagImplementation = {
    preAssignOpponentHits: ({ combatState, hits }: PreAssignHitsInput): PreAssignHitsOutput => {
        if (applicableCombatStages.includes(combatState.stage) && sum(Object.values(hits)) > 0) {
            const newHits = { ...hits };
            newHits[HitType.Normal] = (newHits[HitType.Normal] ?? 0) + 1;
            return { newHits };
        }
        return {};
    },
};
