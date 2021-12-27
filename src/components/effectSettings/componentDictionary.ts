import { FactionUpgrade, ParticipantTag } from "model/combatTags";
import { SparseDictionary } from "model/common";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";
import { CreussDimensionalSplicer } from "./CreussDimensionalSplicer";
import { MentakAdaptableOrdnanceRigs } from "./MentakAdaptableOrdnanceRigs";
import { MuaatMagmusReactor } from "./MuaatMagmusReactor";

export const participantTagSettingsUi: SparseDictionary<ParticipantTag, React.FC<ParticipantTagCustomSettingsUiProps>> = {
    [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS]: MentakAdaptableOrdnanceRigs,
    [FactionUpgrade.MUAAT_MAGMUS_REACTOR]: MuaatMagmusReactor,
    [FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER]: CreussDimensionalSplicer,
};
