import { isNumber, sumBy } from "lodash";

import { getUnitHitProbability, maskHitType, unmaskHitType } from "logic/calculator";
import {
    CombatStage,
    CombatType,
    HIT_TYPE_BITMASK,
    HitCount,
    HitsProbabilityIntermediateOutcome,
    HitType,
    HitTypeFlags,
    ParticipantRole,
} from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { FactionAbility, FactionUpgrade } from "model/combatTags";
import {
    OnCalculateHitsInput,
    OnEndOfStageInput,
    OnEndOfStageOutput,
    ParticipantTagImplementation,
    PreAssignHitsInput,
    PreAssignHitsOutput,
} from "model/effects";
import { UnitDefinition, unitDefinitions, UnitType } from "model/unit";

const conversionRollTargetValue: number = 5;

export interface YinIndoctrinateSettings {
    shipPresent: boolean;
}

const yinIndoctrinateDefaultSettings: YinIndoctrinateSettings = {
    shipPresent: true,
};

export const yinIndoctrinate: ParticipantTagImplementation<YinIndoctrinateSettings> = {
    onCalculateHits: ({ calculationInput, role, combatState, outcome }: OnCalculateHitsInput) => {
        // 1. Simulate the conversion roll by creating new combat roll outcomes using a custom hit type

        if (role !== ParticipantRole.Attacker) return {};
        if (calculationInput.combatType !== CombatType.InvasionCombat) return {};
        if (combatState.stage !== CombatStage.StartOfBattle) return {};

        const settings: YinIndoctrinateSettings =
            calculationInput[role].tags[FactionAbility.YIN_INVASION_CONVERSION] ?? yinIndoctrinateDefaultSettings;
        if (!settings.shipPresent) return {};

        const numberOfRolls: number = calculationInput[role].tags[FactionUpgrade.YIN_SUBLIMINAL_COMMAND] ? 2 : 1;

        let newOutcomes: HitsProbabilityIntermediateOutcome[] = [outcome];
        for (let i = 0; i < numberOfRolls; i++) {
            newOutcomes = newOutcomes.flatMap((o) => doConversionRoll(o));
        }
        return { newOutcomes };
    },
    preAssignOpponentHits: ({ hits, units }: PreAssignHitsInput): PreAssignHitsOutput => {
        // 2. If any conversion rolls hit, remove units from the opponent and store the type of units removed in the tagState

        const matchingHitTypes: HitType[] = Object.keys(hits)
            .map((key) => Number(key))
            .filter((hitType) => (unmaskHitType(hitType).hitType & HIT_TYPE_BITMASK) === HitType.YinConversionRoll);

        const hitCount: number = sumBy(matchingHitTypes, (hitType) => hits[hitType]!);

        if (hitCount === 0) {
            return {};
        }

        let newUnits = units;
        let newTagState: number = 0;

        for (let i = 0; i < hitCount; i++) {
            const unitToConvert =
                newUnits.find((u) => u.type === UnitType.GroundForce) ?? newUnits.find((u) => u.type === UnitType.ShockTroop);

            if (unitToConvert) {
                newUnits = newUnits.filter((u) => u !== unitToConvert);
                newTagState += unitToConvert.type === UnitType.ShockTroop ? 10 : 1;
            }
        }

        return { newUnits, newTagState };
    },
    onEndOfStage: ({ units, tagState }: OnEndOfStageInput): OnEndOfStageOutput => {
        // 3. If any converted units are stored in the tagState, add them to your own units

        if (!isNumber(tagState) || tagState === 0) {
            return {};
        }

        const groundForceCount = tagState % 10;
        const shockTroopCount = Math.floor(tagState / 10);

        const newUnits: ComputedUnitSnapshot[] = [...units];

        for (let i = 0; i < groundForceCount; i++) {
            newUnits.push(createNewUnit(UnitType.GroundForce));
        }
        for (let i = 0; i < shockTroopCount; i++) {
            newUnits.push(createNewUnit(UnitType.ShockTroop));
        }

        return { newUnits, newTagState: 0 };
    },
    settings: {
        default: yinIndoctrinateDefaultSettings,
        encode: (settings: YinIndoctrinateSettings) => (settings.shipPresent ? "1" : "0"),
        decode: (str: string) => ({
            shipPresent: str === "1",
        }),
    },
};

function doConversionRoll(outcome: HitsProbabilityIntermediateOutcome): HitsProbabilityIntermediateOutcome[] {
    const hitType = HitType.YinConversionRoll | HitTypeFlags.NotCombatRoll;
    const maskedHitType = maskHitType(hitType, conversionRollTargetValue);
    const hitProbability: number = getUnitHitProbability(conversionRollTargetValue);

    const currentHitsOfType: HitCount | undefined = outcome.hits[maskedHitType];

    return [
        // The reroll hit
        {
            probability: outcome.probability * hitProbability,
            hits: {
                ...outcome.hits,
                [maskedHitType]: {
                    hits: (currentHitsOfType?.hits ?? 0) + 1,
                    rolls: (currentHitsOfType?.hits ?? 0) + 1,
                },
            },
        },
        // The reroll missed
        {
            probability: outcome.probability * (1.0 - hitProbability),
            hits: {
                ...outcome.hits,
                [maskedHitType]: {
                    hits: currentHitsOfType?.hits ?? 0,
                    rolls: (currentHitsOfType?.hits ?? 0) + 1,
                },
            },
        },
    ];
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
