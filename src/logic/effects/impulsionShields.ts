import { determineHitTarget } from "logic/calculator";
import { HitType, ParticipantRole } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

export const impulsionShields: ParticipantTagImplementation = {
    preAssignHits: ({ calculationInput, role, units, hits, tagState }: PreAssignHitsInput): PreAssignHitsOutput => {
        const canNegateHit: boolean = role === ParticipantRole.Attacker && tagState !== 1;
        if (!canNegateHit) {
            return {};
        }
        for (let hitType of negateHitPriorityOrder) {
            const hitsOfType: number | undefined = hits[hitType];
            if (hitsOfType === undefined || hitsOfType === 0) continue; // No hits of type
            if (determineHitTarget(units, hitType, calculationInput.combatType) === -1) continue; // Hit of type can't be assigned to any of your units
            return {
                // Mark impulsion shields as used
                newTagState: 1,
                // Reduce hit count of type by 1
                newHits: {
                    ...hits,
                    [hitType]: hitsOfType - 1,
                },
            };
        }
        return {};
    },
};

const negateHitPriorityOrder: HitType[] = [HitType.Normal, HitType.AssignToFighter];
