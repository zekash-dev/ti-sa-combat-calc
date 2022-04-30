import { canAssignHitToUnit, getUnitHitProbability, unmaskHitType } from "logic/calculator";
import { getOpponentRole } from "logic/participant";
import {
    combatRoundStages,
    CombatStage,
    CombatType,
    HitCount,
    HitsProbabilityIntermediateOutcome,
    ParticipantRole,
} from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { CommonParticipantTag } from "model/combatTags";
import { OnCalculateHitsInput, ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export interface GeneralSettings {
    enableRerolls: boolean;
}

const generalDefaultSettings: GeneralSettings = {
    enableRerolls: true,
};

const applicableUnitTypes: UnitType[] = [UnitType.GroundForce, UnitType.ShockTroop, UnitType.Mech];

export const general: ParticipantTagImplementation<GeneralSettings> = {
    onComputeUnitSnapshots: ({ calculationInput, units }: ParticipantOnComputeSnapshotInput) => {
        if (calculationInput.combatType === CombatType.InvasionCombat) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
                unit.combatValue--;
            }
        }
    },
    onComputeOpponentUnitSnapshots: ({ role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // 'role' here indicates the role of the effect owner
        if (role === ParticipantRole.Defender && stage === CombatStage.Bombardment) {
            for (let unit of units) {
                unit.combatValue += 3;
            }
        }
    },
    onCalculateHits: ({ calculationInput, role, combatState, outcome }: OnCalculateHitsInput) => {
        const settings: GeneralSettings = calculationInput[role].tags[CommonParticipantTag.GENERAL] ?? generalDefaultSettings;
        if (
            calculationInput.combatType === CombatType.InvasionCombat &&
            combatRoundStages.includes(combatState.stage) &&
            settings.enableRerolls
        ) {
            const opponentUnits: UnitState[] = combatState[getOpponentRole(role)].units;
            let newOutcomes: HitsProbabilityIntermediateOutcome[] = [outcome];
            for (let i = 0; i < 2; i++) {
                newOutcomes = newOutcomes.flatMap((o) => rerollBestValueMiss(o, opponentUnits, calculationInput.combatType));
            }
            return { newOutcomes };
        }

        return {};
    },
    settings: {
        default: generalDefaultSettings,
        encode: (settings: GeneralSettings) => (settings.enableRerolls ? "1" : "0"),
        decode: (str: string) => ({
            enableRerolls: str === "1",
        }),
    },
};

function rerollBestValueMiss(
    outcome: HitsProbabilityIntermediateOutcome,
    opponentUnits: UnitState[],
    combatType: CombatType
): HitsProbabilityIntermediateOutcome[] {
    const maskedHitTypes: number[] = Object.keys(outcome.hits).map((k) => Number(k));

    let bestValueMissKey: number = NaN;
    for (let maskedHitType of maskedHitTypes) {
        const { combatValue, hitType } = unmaskHitType(maskedHitType);
        const hitCount: HitCount = outcome.hits[maskedHitType]!;
        if (hitCount.hits < hitCount.rolls && opponentUnits.some((unit) => canAssignHitToUnit(unit, hitType, combatType))) {
            if (isNaN(bestValueMissKey) || unmaskHitType(bestValueMissKey).combatValue > combatValue) {
                bestValueMissKey = maskedHitType;
            }
        }
    }

    if (!isNaN(bestValueMissKey)) {
        const hitProbability: number = getUnitHitProbability(unmaskHitType(bestValueMissKey).combatValue);
        return [
            // The reroll hit
            {
                probability: outcome.probability * hitProbability,
                hits: {
                    ...outcome.hits,
                    [bestValueMissKey]: {
                        hits: outcome.hits[bestValueMissKey]!.hits + 1,
                        rolls: outcome.hits[bestValueMissKey]!.rolls,
                    },
                },
            },
            // The reroll missed
            {
                probability: outcome.probability * (1.0 - hitProbability),
                hits: outcome.hits,
            },
        ];
    }
    return [outcome];
}
