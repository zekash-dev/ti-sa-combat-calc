import { defaultCancelHitPriorityOrder, determineHitTarget, enumerateHitTypesByPriorityOrder } from "logic/calculator";
import { HitType, HitTypeFlags, ParticipantRole } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

export const impulsionShields: ParticipantTagImplementation = {
    preAssignHits: ({ calculationInput, role, units, hits, tagState }: PreAssignHitsInput): PreAssignHitsOutput => {
        const canCancelHit: boolean = role === ParticipantRole.Attacker && tagState !== 1;
        if (!canCancelHit) {
            return {};
        }
        const orderedHitTypes: HitType[] = enumerateHitTypesByPriorityOrder(hits, defaultCancelHitPriorityOrder);
        for (let hitType of orderedHitTypes) {
            // Can't cancel hits not scored by combat rolls
            if (hitType & HitTypeFlags.NotCombatRoll) continue;

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
