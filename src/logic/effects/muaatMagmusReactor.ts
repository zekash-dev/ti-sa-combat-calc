import { ComputedUnitSnapshot } from "model/combatState";
import { FactionUpgrade } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";
import { UnitType } from "model/unit";

export interface MuaatMagmusReactorSettings {
    warSunsLeavingSupernova: number;
}

export const muaatMagmusReactorDefaultSettings: MuaatMagmusReactorSettings = {
    warSunsLeavingSupernova: 0,
};

export const muaatMagmusReactor: ParticipantTagImplementation = {
    onComputeUnitSnapshots: ({ calculationInput, role, units }: ParticipantOnComputeSnapshotInput) => {
        const settings: MuaatMagmusReactorSettings =
            calculationInput[role].tags[FactionUpgrade.MUAAT_MAGMUS_REACTOR] ?? muaatMagmusReactorDefaultSettings;
        let currentUnit: number = 0;
        for (let unit of units.filter((u: ComputedUnitSnapshot) => u.type === UnitType.WarSun)) {
            if (currentUnit++ < settings.warSunsLeavingSupernova) {
                unit.combatValue--;
            }
        }
    },
};
