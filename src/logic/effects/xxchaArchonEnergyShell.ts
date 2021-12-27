import { defaultCancelHitPriorityOrder, determineHitTarget, enumerateHitTypesByPriorityOrder } from "logic/calculator";
import { HitType, ParticipantRole } from "model/calculation";
import { SparseDictionary } from "model/common";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

const CANCEL_HIT_LIMIT: number = 2;

export const xxchaArchonEnergyShell: ParticipantTagImplementation = {
    preAssignHits: ({ calculationInput, role, units, hits, tagState }: PreAssignHitsInput): PreAssignHitsOutput => {
        const canCancelHit: boolean = role === ParticipantRole.Defender && (tagState === undefined || tagState < CANCEL_HIT_LIMIT);
        if (!canCancelHit) {
            return {};
        }

        let newTagState: number = tagState ?? 0;
        let newHits: SparseDictionary<HitType, number> = hits;

        const orderedHitTypes: HitType[] = enumerateHitTypesByPriorityOrder(hits, defaultCancelHitPriorityOrder);
        for (let hitType of orderedHitTypes) {
            if (newTagState >= CANCEL_HIT_LIMIT) break;
            if (determineHitTarget(units, hitType, calculationInput.combatType) === -1) continue; // Hit of type can't be assigned to any of your units
            while (newTagState < CANCEL_HIT_LIMIT && (newHits[hitType] ?? 0) > 0) {
                newTagState++;
                newHits = {
                    ...newHits,
                    [hitType]: (newHits[hitType] ?? 0) - 1,
                };
            }
        }
        return {
            newTagState,
            newHits,
        };
    },
};
