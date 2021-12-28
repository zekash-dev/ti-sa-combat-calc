import { HitType } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { unitDefinitions } from "model/unit";

export function mockUnit(partial: Partial<ComputedUnitSnapshot> & Pick<ComputedUnitSnapshot, "type">): ComputedUnitSnapshot {
    return {
        base: partial.base ?? new UnitState(partial.type, partial.sustainedHits ?? 0, {}),
        type: partial.type,
        combatValue: partial.combatValue ?? unitDefinitions[partial.type].combatValue,
        rolls: partial.rolls ?? unitDefinitions[partial.type].combatRolls,
        hitType: partial.hitType ?? HitType.Normal,
        nonStandardRolls: partial.nonStandardRolls ?? [],
        sustainDamage: partial.sustainDamage ?? unitDefinitions[partial.type].sustainDamage,
        sustainedHits: partial.sustainedHits ?? 0,
        planetaryShield: partial.planetaryShield ?? unitDefinitions[partial.type].planetaryShield,
        tagEffects: partial.tagEffects ?? [],
    };
}
