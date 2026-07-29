import { CombatStage, CombatType, HitType } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { FactionUpgrade } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation, PostAssignHitsInput, PostAssignHitsOutput } from "model/effects";
import { UnitType } from "model/unit";

const repairApplicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export interface LetnevSaimocInfusedHullsSettings {
    maxRepairCount: number;
}

const letnevSaimocInfusedHullsDefaultSettings: LetnevSaimocInfusedHullsSettings = {
    maxRepairCount: 5,
};

export const letnevSaimocInfusedHulls: ParticipantTagImplementation<LetnevSaimocInfusedHullsSettings> = {
    onComputeOpponentUnitSnapshots: ({ calculationInput, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // "Hits from Fighters may not be assigned to your non-Fighter ships during the first round of Space Battles"
        if (calculationInput.combatType === CombatType.SpaceBattle && stage === CombatStage.Round1) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Fighter)) {
                unit.hitType = HitType.AssignToFighter;
            }
        }
    },
    postAssignHits: ({ calculationInput, role, stage, units, tagState }: PostAssignHitsInput): PostAssignHitsOutput => {
        // "After each combat round, repair one of your participating ships that did not use Sustain Damage this round."
        if (calculationInput.combatType !== CombatType.SpaceBattle) return {};
        if (!repairApplicableCombatStages.includes(stage)) return {};

        const currentRepairCount = tagState === undefined ? 0 : tagState;
        const settings: LetnevSaimocInfusedHullsSettings | undefined =
            calculationInput[role].tags[FactionUpgrade.LETNEV_SAIMOC_INFUSED_HULLS];
        const maxRepairCount = settings ? settings.maxRepairCount : letnevSaimocInfusedHullsDefaultSettings.maxRepairCount;
        if (currentRepairCount >= maxRepairCount) return {};

        const repairIndex: number = findRepairIndex(units);
        if (repairIndex === -1) return {};

        const newUnits: ComputedUnitSnapshot[] = units.map(
            (u: ComputedUnitSnapshot, i: number): ComputedUnitSnapshot => (i === repairIndex ? repairUnit(u) : u),
        );
        const newTagState: number = currentRepairCount + 1;

        return { newUnits, newTagState };
    },
    settings: {
        default: letnevSaimocInfusedHullsDefaultSettings,
        encode: (settings: LetnevSaimocInfusedHullsSettings) => settings.maxRepairCount.toString(),
        decode: (str: string) => {
            let count = Number(str);
            if (isNaN(count)) {
                count = 0;
            }
            return {
                maxRepairCount: count,
            };
        },
    },
};

function findRepairIndex(units: ComputedUnitSnapshot[]): number {
    let repairIndex = -1;
    let repairValue = NaN;

    for (let i = 0; i < units.length; i++) {
        const unit: ComputedUnitSnapshot = units[i];
        if (unit.sustainedHits > 0 && unit.sustainDamage > 0 && !unit.hasSustainedHitsInCurrentStage) {
            let unitRepairValue = unit.sustainedHits + unit.combatValue;
            if (isNaN(repairValue) || unitRepairValue > repairValue) {
                repairIndex = i;
            }
        }
    }

    return repairIndex;
}

function repairUnit(unit: ComputedUnitSnapshot): ComputedUnitSnapshot {
    return {
        ...unit,
        sustainedHits: 0,
        base: new UnitState(unit.type, 0, unit.base.tags),
    };
}
