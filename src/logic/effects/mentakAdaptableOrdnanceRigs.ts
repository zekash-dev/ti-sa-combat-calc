import { enumerateHitTypesByPriorityOrder } from "logic/calculator";
import { CombatStage, HitType, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { FactionUpgrade } from "model/combatTags";
import { SparseDictionary } from "model/common";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export interface MentakAdaptableOrdnanceRigsSettings {
    cruisersCarryingGroundForces: number;
    useSustain: boolean;
}

const mentakAdaptableOrdnanceRigsDefaultSettings: MentakAdaptableOrdnanceRigsSettings = {
    cruisersCarryingGroundForces: 0,
    useSustain: true,
};

const sustainStages: CombatStage[] = [
    CombatStage.SpaceMines,
    CombatStage.SpaceCannon,
    CombatStage.StartOfBattle,
    CombatStage.AntiFighterBarrage,
    CombatStage.PreCombat,
];

export const mentakAdaptableOrdnanceRigs: ParticipantTagImplementation<MentakAdaptableOrdnanceRigsSettings> = {
    preAssignHits: ({ calculationInput, combatState, role, units, hits }) => {
        const settings: MentakAdaptableOrdnanceRigsSettings =
            calculationInput[role].tags[FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS] ?? mentakAdaptableOrdnanceRigsDefaultSettings;
        if (role === ParticipantRole.Attacker && settings.useSustain && sustainStages.includes(combatState.stage)) {
            let newHits: SparseDictionary<HitType, number> = hits;
            const newUnits: ComputedUnitSnapshot[] = [...units];
            let currentUnit: number = 0;
            for (let i = 0; i < units.length; i++) {
                const unit: ComputedUnitSnapshot = units[i];
                if (unit.type !== UnitType.Cruiser) continue;
                if (unit.base.tags && unit.base.tags[FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS] === 1) continue;
                if (++currentUnit > settings.cruisersCarryingGroundForces) {
                    const sustainResult = sustainHitIfRequired(newHits, unit);
                    if (sustainResult) {
                        newHits = sustainResult.newHits;
                        newUnits[i] = sustainResult.newUnit;
                    }
                }
            }
            return { newHits, newUnits };
        }
        return {};
    },
    onComputeUnitSnapshots: ({ calculationInput, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        const settings: MentakAdaptableOrdnanceRigsSettings =
            calculationInput[role].tags[FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS] ?? mentakAdaptableOrdnanceRigsDefaultSettings;
        if (role === ParticipantRole.Attacker) {
            let currentUnit: number = 0;
            for (let unit of units.filter((u) => u.type === UnitType.Cruiser)) {
                // If the unit has used the sustain ability, mark it as used (to reduce shots granted by an admiral etc.)
                if (unit.base.hasTagValue(FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS, 1)) {
                    unit.sustainDamage++;
                }
                // Grant the unit an additional roll in round 1
                else if (stage === CombatStage.Round1 && ++currentUnit > settings.cruisersCarryingGroundForces) {
                    unit.rolls++;
                }
            }
        }
    },
    settings: {
        default: mentakAdaptableOrdnanceRigsDefaultSettings,
        encode: (settings: MentakAdaptableOrdnanceRigsSettings) =>
            `${settings.cruisersCarryingGroundForces.toString()}z${settings.useSustain ? "1" : "0"}`,
        decode: (str: string) => {
            const split = str.split("z");
            let count = Number(split[0]);
            if (isNaN(count)) {
                count = 0;
            }
            return {
                cruisersCarryingGroundForces: count,
                useSustain: split[1] === "1",
            };
        },
    },
};

interface SustainHitOutput {
    newUnit: ComputedUnitSnapshot;
    newHits: SparseDictionary<HitType, number>;
}

function sustainHitIfRequired(hits: SparseDictionary<HitType, number>, unit: ComputedUnitSnapshot): SustainHitOutput | undefined {
    const orderedHitTypes: HitType[] = enumerateHitTypesByPriorityOrder(hits, cancelHitPriorityOrder);
    for (let hitType of orderedHitTypes) {
        const hitsOfType: number | undefined = hits[hitType];
        if (hitsOfType === undefined || hitsOfType === 0) continue; // No hits of type

        return {
            // Reduce hit count of type by 1
            newHits: {
                ...hits,
                [hitType]: hitsOfType - 1,
            },
            // Give the unit a sustained hit, and add the tag
            newUnit: {
                ...unit,
                base: new UnitState(unit.base.type, unit.base.sustainedHits + 1, {
                    ...unit.base.tags,
                    [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS]: 1,
                }),
                sustainDamage: unit.sustainDamage + 1,
            },
        };
    }
    return undefined;
}

const cancelHitPriorityOrder: HitType[] = [HitType.AssignToNonFighterFirst, HitType.AssignToNonFighter, HitType.Normal];
