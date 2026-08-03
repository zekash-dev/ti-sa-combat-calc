import { CommonParticipantTag, FactionAbility, FactionUpgrade, ParticipantTag } from "model/combatTags";
import { SparseDictionary } from "model/common";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";
import { CreussDimensionalSplicer } from "./CreussDimensionalSplicer";
import { General } from "./General";
import { MentakAdaptableOrdnanceRigs } from "./MentakAdaptableOrdnanceRigs";
import { MuaatMagmusReactor } from "./MuaatMagmusReactor";
import { LetnevSaimocInfusedHulls } from "./LetnevSaimocInfusedHulls";
import { YinIndoctrinate } from "./YinIndoctrinate";

export const participantTagSettingsUi: SparseDictionary<ParticipantTag, React.FC<ParticipantTagCustomSettingsUiProps>> = {
    [FactionAbility.YIN_INVASION_CONVERSION]: YinIndoctrinate,
    [FactionUpgrade.LETNEV_SAIMOC_INFUSED_HULLS]: LetnevSaimocInfusedHulls,
    [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS]: MentakAdaptableOrdnanceRigs,
    [FactionUpgrade.MUAAT_MAGMUS_REACTOR]: MuaatMagmusReactor,
    [FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER]: CreussDimensionalSplicer,
    [CommonParticipantTag.GENERAL]: General,
};
