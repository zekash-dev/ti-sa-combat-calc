import { CombatStage, CombatType, HitType } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export const saimocInfusedHulls: ParticipantTagImplementation = {
    onComputeOpponentUnitSnapshots: ({ calculationInput, stage, units }: ParticipantOnComputeSnapshotInput) => {
        // "Hits from Fighters may not be assigned to your non-Fighter ships during the first round of Space Battles"
        if (calculationInput.combatType === CombatType.SpaceBattle && stage === CombatStage.Round1) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Fighter)) {
                unit.hitType = HitType.AssignToFighter;
            }
        }
    },
};
