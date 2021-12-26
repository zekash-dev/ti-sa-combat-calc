import { floor } from "lodash";

import { CombatStage, HitType } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";
import { UnitType } from "model/unit";

export const naaluFlagship: ParticipantTagImplementation = {
    preAssignHits: ({ combatState, units, hits }: PreAssignHitsInput): PreAssignHitsOutput => {
        if (combatState.stage === CombatStage.AntiFighterBarrage) {
            const fighterCount: number = units.filter((u) => u.type === UnitType.Fighter).length;
            const maxHitCount: number = floor(fighterCount / 2);
            const hitCount = hits[HitType.AssignToFighter] ?? 0;
            if (hitCount > maxHitCount) {
                return {
                    newHits: {
                        ...hits,
                        [HitType.AssignToFighter]: maxHitCount,
                    },
                };
            }
        }
        return {};
    },
};
