import { FactionUpgrade, ParticipantTag } from "model/combatTags";
import { SparseDictionary } from "model/common";
import { ParticipantTagCustomSettingsUiProps } from "model/effects";
import { MentakAdaptableOrdnanceRigs } from "./MentakAdaptableOrdnanceRigs";

export const participantTagSettingsUi: SparseDictionary<ParticipantTag, React.FC<ParticipantTagCustomSettingsUiProps>> = {
    [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS]: MentakAdaptableOrdnanceRigs,
};
