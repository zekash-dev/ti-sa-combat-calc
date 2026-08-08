import { getOpponentRole } from "logic/participant";
import { CombatStage, HitType } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { OnEndOfStageInput, OnEndOfStageOutput, ParticipantTagImplementation } from "model/effects";
import { UnitDefinition, unitDefinitions, UnitType } from "model/unit";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];
const maxUsages = 5;

export const virusFlagship: ParticipantTagImplementation = {
    onEndOfStage: ({ previousCombatState, combatState, role, units, tagState }: OnEndOfStageInput): OnEndOfStageOutput => {
        if (!applicableCombatStages.includes(combatState.stage)) {
            return {};
        }

        const currentUsages = tagState === undefined ? 0 : tagState;
        if (currentUsages >= maxUsages) return {};

        const opponentRole = getOpponentRole(role);
        const oldOpponentUnits = previousCombatState[opponentRole].units;
        const newOpponentUnits = combatState[opponentRole].units;

        const reanimatedUnit: ComputedUnitSnapshot | undefined =
            tryReanimateUnitOfType(oldOpponentUnits, newOpponentUnits, UnitType.Cruiser) ??
            tryReanimateUnitOfType(oldOpponentUnits, newOpponentUnits, UnitType.Destroyer) ??
            tryReanimateUnitOfType(oldOpponentUnits, newOpponentUnits, UnitType.Fighter) ??
            tryReanimateUnitOfType(oldOpponentUnits, newOpponentUnits, UnitType.Carrier);

        if (reanimatedUnit) {
            return {
                newUnits: [...units, reanimatedUnit],
                newTagState: currentUsages + 1,
            };
        }

        return {};
    },
};

function tryReanimateUnitOfType(oldUnits: UnitState[], newUnits: UnitState[], unitType: UnitType): ComputedUnitSnapshot | undefined {
    if (newUnits.filter((x) => x.type === unitType) < oldUnits.filter((x) => x.type === unitType)) {
        return createNewUnit(unitType);
    }
    return undefined;
}

function createNewUnit(unitType: UnitType): ComputedUnitSnapshot {
    const unit = new UnitState(unitType, 0, undefined);
    const def: UnitDefinition = unitDefinitions[unit.type];

    return {
        base: unit,
        type: unit.type,
        combatValue: def.combatValue,
        rolls: def.combatRolls,
        hitType: HitType.Normal,
        nonStandardRolls: [],
        sustainDamage: def.sustainDamage,
        sustainedHits: unit.sustainedHits,
        hasSustainedHitsInCurrentStage: false,
        planetaryShield: def.planetaryShield,
        tagEffects: [],
    };
}
