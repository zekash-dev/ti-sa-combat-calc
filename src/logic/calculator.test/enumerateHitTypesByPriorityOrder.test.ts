import { enumerateHitTypesByPriorityOrder } from "logic/calculator";
import { HitType, HitTypeFlags } from "model/calculation";
import { SparseDictionary } from "model/common";

describe("enumerateHitTypesByPriorityOrder", () => {
    it("works with subset of hit types in input", () => {
        const hits: SparseDictionary<HitType, number> = {
            [HitType.Normal]: 1,
            [HitType.AssignToFighter]: 4,
            [HitType.AssignToNonFighter]: 3,
        };
        const priorityOrder: HitType[] = [
            HitType.AssignToNonFighterFirst,
            HitType.AssignToNonFighter,
            HitType.Normal,
            HitType.AssignToFighter,
        ];
        const expectedResult: HitType[] = [HitType.AssignToNonFighter, HitType.Normal, HitType.AssignToFighter];
        const result: HitType[] = enumerateHitTypesByPriorityOrder(hits, priorityOrder);
        expect(result).toEqual(expectedResult);
    });

    it("works with subset of hit types in priority order", () => {
        const hits: SparseDictionary<HitType, number> = {
            [HitType.Normal]: 1,
            [HitType.AssignToFighter]: 4,
            [HitType.AssignToNonFighter]: 3,
        };
        const priorityOrder: HitType[] = [HitType.AssignToNonFighterFirst, HitType.AssignToNonFighter, HitType.Normal];
        const expectedResult: HitType[] = [HitType.AssignToNonFighter, HitType.Normal];
        const result: HitType[] = enumerateHitTypesByPriorityOrder(hits, priorityOrder);
        expect(result).toEqual(expectedResult);
    });

    it("works with flags in input", () => {
        const hits: SparseDictionary<HitType, number> = {
            [HitType.Normal]: 1,
            [HitType.AssignToFighter]: 4,
            [HitType.AssignToNonFighter | HitTypeFlags.NotCombatRoll]: 3,
        };
        const priorityOrder: HitType[] = [
            HitType.AssignToNonFighterFirst,
            HitType.AssignToNonFighter,
            HitType.Normal,
            HitType.AssignToFighter,
        ];
        const expectedResult: HitType[] = [
            HitType.AssignToNonFighter | HitTypeFlags.NotCombatRoll,
            HitType.Normal,
            HitType.AssignToFighter,
        ];
        const result: HitType[] = enumerateHitTypesByPriorityOrder(hits, priorityOrder);
        expect(result).toEqual(expectedResult);
    });
});
