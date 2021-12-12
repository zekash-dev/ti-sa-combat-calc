import { mockUnit } from "logic/testUtils";
import { CombatStage } from "model/calculation";
import { ComputedUnitSnapshot } from "model/combatState";
import { FactionAbility } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput } from "model/effects";
import { UnitType } from "model/unit";
import { mentakPreCombatShots } from "./mentakPreCombatShots";

describe(FactionAbility[FactionAbility.MENTAK_PRECOMBAT_SHOTS], () => {
    it("Grants shots to 2 cruisers", () => {
        const input: ParticipantOnComputeSnapshotInput = {
            stage: CombatStage.PreCombat,
            units: [
                mockUnit({ type: UnitType.Cruiser, rolls: 0 }),
                mockUnit({ type: UnitType.Cruiser, rolls: 0 }),
                mockUnit({ type: UnitType.Cruiser, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
            ],
        };

        const expectedUnits: ComputedUnitSnapshot[] = [
            mockUnit({ type: UnitType.Cruiser, rolls: 1 }),
            mockUnit({ type: UnitType.Cruiser, rolls: 1 }),
            mockUnit({ type: UnitType.Cruiser, rolls: 0 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
        ];
        mentakPreCombatShots.onComputeUnitSnapshots!(input);
        expect(input.units).toEqual(expectedUnits);
    });

    it("Grants shots to a cruiser and a destroyer", () => {
        const input: ParticipantOnComputeSnapshotInput = {
            stage: CombatStage.PreCombat,
            units: [
                mockUnit({ type: UnitType.Cruiser, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
                mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
            ],
        };

        const expectedUnits: ComputedUnitSnapshot[] = [
            mockUnit({ type: UnitType.Cruiser, rolls: 1 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 1 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
            mockUnit({ type: UnitType.Destroyer, rolls: 0 }),
        ];
        mentakPreCombatShots.onComputeUnitSnapshots!(input);
        expect(input.units).toEqual(expectedUnits);
    });
});
