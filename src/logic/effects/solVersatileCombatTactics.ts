import { floor, max } from "lodash";

import { unitIsCombatant } from "logic/calculator";
import { getOpponentRole } from "logic/participant";
import { combatRoundStages, CombatStage, CombatType, HitType, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";
import { unitDefinitions, UnitType } from "model/unit";

const applicableUnitTypes: UnitType[] = [UnitType.GroundForce, UnitType.ShockTroop];

export const solVersatileCombatTactics: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, combatState, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (calculationInput.combatType !== CombatType.InvasionCombat) return;
        if (!combatRoundStages.includes(stage)) return;
        const opponentRole: ParticipantRole = getOpponentRole(role);
        const myRollCount: number = determineCombatRolls(combatState[role].units, calculationInput.combatType);
        const opponentRollCount: number = determineCombatRolls(combatState[opponentRole].units, calculationInput.combatType);
        if (myRollCount < opponentRollCount) {
            for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
                unit.combatValue -= 2;
            }
        }
    },
    preAssignHits: ({ combatState, role, units, hits }: PreAssignHitsInput): PreAssignHitsOutput => {
        if (role === ParticipantRole.Defender && combatState.stage === CombatStage.Bombardment) {
            const groundForceCount: number = units.filter((u) => applicableUnitTypes.includes(u.type)).length;
            const mechCount: number = units.filter((u) => u.type === UnitType.Mech).length;
            const maxHitCount: number = floor(groundForceCount / 2) + mechCount;
            const hitCount = hits[HitType.Normal] ?? 0;
            if (hitCount > maxHitCount) {
                return {
                    newHits: {
                        ...hits,
                        [HitType.Normal]: maxHitCount,
                    },
                };
            }
        }
        return {};
    },
};

function determineCombatRolls(units: UnitState[], combatType: CombatType): number {
    let totalRolls = 0;
    for (let unit of units.filter((u) => unitIsCombatant(u.type, combatType))) {
        let unitRolls = unitDefinitions[unit.type].combatRolls;
        if (unitRolls > 0 && unit.sustainedHits > 0) {
            unitRolls = max([unitRolls - unit.sustainedHits, 1])!;
        }
        totalRolls += unitRolls;
    }
    return totalRolls;
}
