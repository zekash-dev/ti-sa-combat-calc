import { enumerateHitTypesByPriorityOrder } from "logic/calculator";
import { CombatStage, HitType, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { ConstantTag } from "model/combatTags";
import { SparseDictionary } from "model/common";
import { ParticipantTagImplementation } from "model/effects";

export const planetaryShield: ParticipantTagImplementation = {
    preAssignHits: ({ combatState, role, units, hits }) => {
        if (role === ParticipantRole.Defender && combatState.stage === CombatStage.Bombardment) {
            let newHits: SparseDictionary<HitType, number> = hits;
            const newUnits: ComputedUnitSnapshot[] = [...units];
            for (let i = 0; i < units.length; i++) {
                const unit: ComputedUnitSnapshot = units[i];
                if (unit.planetaryShield === 0) continue;
                const cancelResult = cancelHits(newHits, unit);
                if (cancelResult) {
                    newHits = cancelResult.newHits;
                    newUnits[i] = cancelResult.newUnit;
                }
            }
            return { newHits, newUnits };
        }
        return {};
    },
};

interface CancelHitOutput {
    newUnit: ComputedUnitSnapshot;
    newHits: SparseDictionary<HitType, number>;
}

function cancelHits(hits: SparseDictionary<HitType, number>, unit: ComputedUnitSnapshot): CancelHitOutput | undefined {
    const prevTagState: number = unit.base.tags ? unit.base.tags[ConstantTag.PLANETARY_SHIELD] ?? 0 : 0;
    let newTagState: number = prevTagState;
    let newHits: SparseDictionary<HitType, number> = hits;
    const orderedHitTypes: HitType[] = enumerateHitTypesByPriorityOrder(hits, cancelHitPriorityOrder);
    for (let hitType of orderedHitTypes) {
        while (newTagState < unit.planetaryShield && (newHits[hitType] ?? 0) > 0) {
            newTagState++;
            newHits = {
                ...newHits,
                [hitType]: (newHits[hitType] ?? 0) - 1,
            };
        }
    }
    if (newHits === hits && newTagState === prevTagState) {
        return undefined;
    }
    return {
        newHits,
        newUnit: {
            ...unit,
            base: new UnitState(unit.base.type, unit.base.sustainedHits, {
                ...unit.base.tags,
                [ConstantTag.PLANETARY_SHIELD]: newTagState,
            }),
        },
    };
}

const cancelHitPriorityOrder: HitType[] = [HitType.Normal];
