import { unitIsCombatant } from "logic/calculator";
import { CombatStage, CombatType, HitType, HitTypeFlags } from "model/calculation";
import { FactionUpgrade } from "model/combatTags";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

export interface CreussDimensionalSplicerSettings {
    wormholePresent: boolean;
}

export const creussDimensionalSplicerDefaultSettings: CreussDimensionalSplicerSettings = {
    wormholePresent: true,
};

export const creussDimensionalSplicer: ParticipantTagImplementation = {
    preAssignOpponentHits: ({ calculationInput, combatState, role, hits }: PreAssignHitsInput): PreAssignHitsOutput => {
        const settings: CreussDimensionalSplicerSettings =
            calculationInput[role].tags[FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER] ?? creussDimensionalSplicerDefaultSettings;
        if (
            calculationInput.combatType === CombatType.SpaceBattle &&
            combatState.stage === CombatStage.StartOfBattle &&
            combatState[role].units.some((u) => unitIsCombatant(u.type, calculationInput.combatType)) &&
            settings.wormholePresent
        ) {
            const newHits = { ...hits };
            const splicerHitType: HitType = HitType.AssignToNonFighter & HitTypeFlags.NotCombatRoll;
            newHits[splicerHitType] = (newHits[splicerHitType] ?? 0) + 1;
            return { newHits };
        }
        return {};
    },
};
