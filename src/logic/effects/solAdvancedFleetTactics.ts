import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

const applicableCombatStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];
const applicableUnitTypes: UnitType[] = [UnitType.Fighter, UnitType.Carrier];
const FIGHTER_SHOTS_LIMIT = 3;
const CARRIER_SHOTS_LIMIT = 1;

export const solAdvancedFleetTactics: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ stage, units }: ParticipantOnComputeSnapshotInput) => {
        if (!applicableCombatStages.includes(stage)) return;

        let grantedFighterShots = 0;
        let grantedCarrierShots = 0;
        for (let unit of units.filter((u: ComputedUnitSnapshot) => applicableUnitTypes.includes(u.type))) {
            if (unit.type === UnitType.Fighter && grantedFighterShots < FIGHTER_SHOTS_LIMIT) {
                unit.combatValue -= 2;
                grantedFighterShots++;
            }
            if (unit.type === UnitType.Carrier && grantedCarrierShots < CARRIER_SHOTS_LIMIT) {
                unit.combatValue -= 2;
                grantedCarrierShots++;
            }
            if (grantedFighterShots >= FIGHTER_SHOTS_LIMIT && grantedCarrierShots >= CARRIER_SHOTS_LIMIT) break;
        }
    },
};
