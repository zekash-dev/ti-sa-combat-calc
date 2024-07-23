import { CommonParticipantTag } from "model/combatTags";
import { ParticipantOnComputeSnapshotInput, ParticipantTagImplementation } from "model/effects";

export interface ParticipantCombatValueModSettings {
    mod: number;
}

const muaatMagmusReactorDefaultSettings: ParticipantCombatValueModSettings = {
    mod: 0,
};

export const participantCombatValueMod: ParticipantTagImplementation<ParticipantCombatValueModSettings> = {
    onComputeUnitSnapshots: ({ calculationInput, role, units }: ParticipantOnComputeSnapshotInput) => {
        const settings: ParticipantCombatValueModSettings =
            calculationInput[role].tags[CommonParticipantTag.COMBAT_VALUE_MOD] ?? muaatMagmusReactorDefaultSettings;
        if (settings.mod !== 0) {
            for (let unit of units) {
                unit.combatValue -= settings.mod;
            }
        }
    },
    settings: {
        default: muaatMagmusReactorDefaultSettings,
        encode: (settings: ParticipantCombatValueModSettings) => settings.mod.toString(),
        decode: (str: string) => ({
            mod: isNaN(Number(str)) ? 0 : Number(str),
        }),
    },
};
