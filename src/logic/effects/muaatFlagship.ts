import { unitIsCombatant } from "logic/calculator";
import { getOpponentRole } from "logic/participant";
import { CombatStage, ParticipantRole } from "model/calculation";
import { ComputedUnitSnapshot, UnitState } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export const muaatFlagship: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, combatState, role, stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (!applicableCombatStages.includes(stage)) return;
        for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.Flagship)) {
            const opponentRole: ParticipantRole = getOpponentRole(role);
            const opposingNonFighterShips: number = combatState[opponentRole].units.filter(
                (u: UnitState) => unitIsCombatant(u.type, calculationInput.combatType) && u.type !== UnitType.Fighter
            ).length;
            unit.rolls = opposingNonFighterShips;
        }
    },
};
