import { blue, green, red, yellow } from "@mui/material/colors";
import { union } from "lodash";

import {
    CalculationInput,
    CombatStage,
    CombatStageResources,
    CombatType,
    ParticipantInputTags,
    ParticipantRole,
    RichUnit,
    UnitInput,
} from "model/calculation";
import { CombatState, ComputedUnitSnapshot } from "model/combatState";
import {
    CombatTag,
    CommonParticipantTag,
    ConstantTag,
    Faction,
    FactionAbility,
    FactionResources,
    FactionUpgrade,
    FlagshipTag,
    ParticipantTag,
    ParticipantTagResources,
    Technology,
    TechnologyResources,
    TechnologyType,
    UnitTag,
    UnitTagResources,
} from "model/combatTags";
import { KeyedDictionary } from "model/common";
import { allUnitTypes, FlagshipDefinition, unitDefinitions, UnitType } from "model/unit";
import { getInitialState, getUnitSnapshots } from "./calculator";
import { getAllEnumValues } from "./common";
import * as effects from "./effects";

export function grantDefaultFactionAbilities(participantTags: ParticipantInputTags, faction: Faction): ParticipantInputTags {
    const newTags: ParticipantInputTags = {
        ...participantTags,
    };
    for (let oldAbility of getAllEnumValues<FactionAbility>(FactionAbility)) {
        delete newTags[oldAbility];
    }
    for (let oldAbility of getAllEnumValues<FactionUpgrade>(FactionUpgrade)) {
        delete newTags[oldAbility];
    }
    for (let oldAbility of getAllEnumValues<Technology>(Technology)) {
        delete newTags[oldAbility];
    }
    for (let newAbility of defaultFactionAbilities[faction]) {
        if (participantTagResources[newAbility].implementation !== false) {
            newTags[newAbility] = getParticipantTagDefaultValue(newAbility);
        }
    }
    for (let newAbility of defaultFactionTechnologies[faction]) {
        if (participantTagResources[newAbility].implementation !== false) {
            newTags[newAbility] = getParticipantTagDefaultValue(newAbility);
        }
    }
    return newTags;
}

export function getSelectableUnitTypes(calculationInput: CalculationInput, role: ParticipantRole): UnitType[] {
    let unitTypes: UnitType[] = Object.values(unitDefinitions)
        .filter((def) => def.combatantIn.includes(calculationInput.combatType))
        .map((def) => def.type);
    if (calculationInput.combatType === CombatType.SpaceBattle) {
        unitTypes = union(unitTypes, getUnitTypesWithCombatRelevanceInStage(calculationInput, role, CombatStage.SpaceCannon));
    }
    if (calculationInput.combatType === CombatType.InvasionCombat) {
        unitTypes = union(unitTypes, getUnitTypesWithCombatRelevanceInStage(calculationInput, role, CombatStage.Bombardment));
        unitTypes = union(unitTypes, getUnitTypesWithCombatRelevanceInStage(calculationInput, role, CombatStage.InvasionDefence));
    }
    return unitTypes;
}

/**
 * Returns units that in the given stage either:
 * 1. Has combat rolls
 * 2. Has planetary shields
 */
function getUnitTypesWithCombatRelevanceInStage(calculationInput: CalculationInput, role: ParticipantRole, stage: CombatStage): UnitType[] {
    const input: CalculationInput = {
        combatType: calculationInput.combatType,
        attacker: {
            ...calculationInput.attacker,
            units: [],
        },
        defender: {
            ...calculationInput.defender,
            units: [],
        },
        tags: calculationInput.tags,
        settings: {
            simplificationTarget: undefined,
        },
    };
    input[role].units = allUnitTypes.map((uType) => ({ type: uType, sustainedHits: 0 }));
    const combatState: CombatState = getInitialState(input);
    const snapshots: ComputedUnitSnapshot[] = getUnitSnapshots(combatState, input, role, stage);
    return snapshots.filter((unit) => unit.rolls > 0 || unit.planetaryShield > 0).map((unit) => unit.type);
}

export const unitSizes: KeyedDictionary<UnitType, number> = Object.fromEntries(
    allUnitTypes.map((type: UnitType) => [type, unitDefinitions[type].imageSize.x * unitDefinitions[type].imageSize.y])
) as KeyedDictionary<UnitType, number>;

export function richUnitSizeComparer(a: RichUnit, b: RichUnit): number {
    return unitSizes[b.input.type] - unitSizes[a.input.type];
}
export function unitInputSizeComparer(a: UnitInput, b: UnitInput): number {
    return unitSizes[b.type] - unitSizes[a.type];
}

export function getOpponentRole(role: ParticipantRole): ParticipantRole {
    return role === ParticipantRole.Attacker ? ParticipantRole.Defender : ParticipantRole.Attacker;
}

export const defaultFactionAbilities: KeyedDictionary<Faction, FactionAbility[]> = {
    [Faction.BARONY_OF_LETNEV]: [],
    [Faction.CLAN_OF_SAAR]: [],
    [Faction.EMIRATES_OF_HACAN]: [],
    [Faction.FEDERATION_OF_SOL]: [],
    [Faction.MENTAK_COALITION]: [FactionAbility.MENTAK_PRECOMBAT_SHOTS],
    [Faction.NAALU_COLLECTIVE]: [FactionAbility.NAALU_FIGHTER_MOD],
    [Faction.KROTOAN_VIRUS]: [],
    [Faction.HIVES_OF_SARDAKK_NORR]: [FactionAbility.SARDAKK_UNIT_MOD],
    [Faction.UNIVERSITIES_OF_JOLNAR]: [FactionAbility.JOLNAR_UNIT_MOD, FactionAbility.JOLNAR_REROLL],
    [Faction.WINNU_SOVEREIGNTY]: [],
    [Faction.XXCHA_KINGDOM]: [FactionAbility.XXCHA_ROUND1_MOD],
    [Faction.TRIBES_OF_YSSARIL]: [],
    [Faction.YIN_BROTHERHOOD]: [FactionAbility.YIN_ROUND2_SACRIFICE, FactionAbility.YIN_INVASION_CONVERSION],
    [Faction.EMBERS_OF_MUAAT]: [],
    [Faction.GHOSTS_OF_CREUSS]: [],
    [Faction.LIZIX_MINDNET]: [FactionAbility.LIZIX_DREADNOUGHT_MOD, FactionAbility.LIZIX_GROUND_FORCE_MOD],
    [Faction.ARBOREC_ECOSYSTEM]: [FactionAbility.ARBOREC_GROUND_FORCE_MOD],
    [Faction.ORDER_OF_THE_LAST]: [],
};

export const defaultFactionTechnologies: KeyedDictionary<Faction, Technology[]> = {
    [Faction.BARONY_OF_LETNEV]: [Technology.HYLAR_V_LASER, Technology.IMPULSION_SHIELDS],
    [Faction.CLAN_OF_SAAR]: [],
    [Faction.EMIRATES_OF_HACAN]: [],
    [Faction.FEDERATION_OF_SOL]: [Technology.CYBERNETICS],
    [Faction.MENTAK_COALITION]: [Technology.HYLAR_V_LASER],
    [Faction.NAALU_COLLECTIVE]: [],
    [Faction.KROTOAN_VIRUS]: [Technology.HYLAR_V_LASER, Technology.GEN_SYNTHESIS],
    [Faction.HIVES_OF_SARDAKK_NORR]: [Technology.HYLAR_V_LASER],
    [Faction.UNIVERSITIES_OF_JOLNAR]: [Technology.HYLAR_V_LASER],
    [Faction.WINNU_SOVEREIGNTY]: [],
    [Faction.XXCHA_KINGDOM]: [],
    [Faction.TRIBES_OF_YSSARIL]: [Technology.MANEUVERING_JETS],
    [Faction.YIN_BROTHERHOOD]: [Technology.HYLAR_V_LASER, Technology.AUTOMATED_TURRETS],
    [Faction.EMBERS_OF_MUAAT]: [Technology.HYLAR_V_LASER],
    [Faction.GHOSTS_OF_CREUSS]: [],
    [Faction.LIZIX_MINDNET]: [Technology.CYBERNETICS, Technology.IMPULSION_SHIELDS],
    [Faction.ARBOREC_ECOSYSTEM]: [],
    [Faction.ORDER_OF_THE_LAST]: [],
};

export const availableFactionUpgrades: KeyedDictionary<Faction, FactionUpgrade[]> = {
    [Faction.BARONY_OF_LETNEV]: [FactionUpgrade.LETNEV_SAIMOC_INFUSED_HULLS],
    [Faction.CLAN_OF_SAAR]: [FactionUpgrade.SAAR_CHAOS_MAPPING],
    [Faction.EMIRATES_OF_HACAN]: [],
    [Faction.FEDERATION_OF_SOL]: [
        FactionUpgrade.SOL_ADVANCED_FLEET_TACTICS,
        FactionUpgrade.SOL_MARK2_ADVANCED_CARRIERS,
        FactionUpgrade.SOL_VERSATILE_COMBAT_TACTICS,
    ],
    [Faction.MENTAK_COALITION]: [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS],
    [Faction.NAALU_COLLECTIVE]: [],
    [Faction.KROTOAN_VIRUS]: [],
    [Faction.HIVES_OF_SARDAKK_NORR]: [FactionUpgrade.SARDAKK_BERZERKER_GENOME],
    [Faction.UNIVERSITIES_OF_JOLNAR]: [],
    [Faction.WINNU_SOVEREIGNTY]: [],
    [Faction.XXCHA_KINGDOM]: [FactionUpgrade.XXCHA_ARCHON_ENERGY_SHELL],
    [Faction.TRIBES_OF_YSSARIL]: [],
    [Faction.YIN_BROTHERHOOD]: [FactionUpgrade.YIN_BLADE_OF_ZEAL, FactionUpgrade.YIN_SUBLIMINAL_COMMAND],
    [Faction.EMBERS_OF_MUAAT]: [FactionUpgrade.MUAAT_MAGMUS_REACTOR, FactionUpgrade.MUAAT_MAGMA_OBLITERATOR],
    [Faction.GHOSTS_OF_CREUSS]: [FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER],
    [Faction.LIZIX_MINDNET]: [],
    [Faction.ARBOREC_ECOSYSTEM]: [],
    [Faction.ORDER_OF_THE_LAST]: [FactionUpgrade.ORDER_CHRONOS_FIELD],
};

export function getParticipantTagDefaultValue<T extends ParticipantTag>(tag: T): any {
    const tagResources = participantTagResources[tag];
    if (tagResources.implementation && tagResources.implementation.settings) {
        return tagResources.implementation.settings.default;
    }
    return true;
}

export const factionResources: KeyedDictionary<Faction, FactionResources> = {
    [Faction.BARONY_OF_LETNEV]: { name: "The Barony of Letnev", letter: "l", color: "#909090" },
    [Faction.CLAN_OF_SAAR]: { name: "The Clan of Saar", letter: "s", color: "#603C1C" },
    [Faction.EMIRATES_OF_HACAN]: { name: "The Emirates of Hacan", letter: "h", color: "#F2DA30" },
    [Faction.FEDERATION_OF_SOL]: { name: "The Federation of Sol", letter: "f", color: "#0061C2" },
    [Faction.MENTAK_COALITION]: { name: "The Mentak Coalition", letter: "m", color: "#E17E20" },
    [Faction.NAALU_COLLECTIVE]: { name: "The Naalu Collective", letter: "n", color: "#AF8F60" },
    [Faction.KROTOAN_VIRUS]: { name: "The Krotoan Virus", letter: "v", color: "#4C181A" },
    [Faction.HIVES_OF_SARDAKK_NORR]: { name: "The Hives of Sardakk N'orr", letter: "i", color: "#D00002" },
    [Faction.UNIVERSITIES_OF_JOLNAR]: { name: "The Universities of Jol-Nar", letter: "j", color: "#8F36AC" },
    [Faction.WINNU_SOVEREIGNTY]: { name: "The Winnu Sovereignty", letter: "w", color: "#6051A4" },
    [Faction.XXCHA_KINGDOM]: { name: "The Xxcha Kingdom", letter: "k", color: "#388F2E" },
    [Faction.TRIBES_OF_YSSARIL]: { name: "The Tribes of Yssaril", letter: "t", color: "#0A4201" },
    [Faction.YIN_BROTHERHOOD]: { name: "The Yin Brotherhood", letter: "b", color: "#FAFAFA" },
    [Faction.EMBERS_OF_MUAAT]: { name: "The Embers of Muaat", letter: "e", color: "#820C00" },
    [Faction.GHOSTS_OF_CREUSS]: { name: "The Ghosts of Creuss", letter: "g", color: "#4EA8CA" },
    [Faction.LIZIX_MINDNET]: { name: "The L1z1x Mindnet", letter: "d", color: "#000CA6" },
    [Faction.ARBOREC_ECOSYSTEM]: { name: "The Arborec Ecosystem", letter: "a", color: "#857A10" },
    [Faction.ORDER_OF_THE_LAST]: { name: "The Order of the Last", letter: "o", color: "#107273" },
};

export const technologyColors: KeyedDictionary<TechnologyType, string> = {
    [TechnologyType.BLUE]: blue[300],
    [TechnologyType.GREEN]: green[500],
    [TechnologyType.RED]: red[500],
    [TechnologyType.YELLOW]: yellow[600],
};

export const technologyResources: KeyedDictionary<Technology, TechnologyResources> = {
    [Technology.HYLAR_V_LASER]: {
        name: "Hylar V Laser",
        description: "Cruisers and Destroyers receive +1 to combat rolls (except those granted by other red Technologies).",
        shortName: "HYL",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.hylarVLaser,
    },
    [Technology.IMPULSION_SHIELDS]: {
        name: "Impulsion Shields",
        description: "Ignore one hit from combat rolls (or Space Mines).",
        shortName: "IMP",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.impulsionShields,
    },
    [Technology.AUTOMATED_TURRETS]: {
        name: "Automated Turrets",
        description: "During Anti-Fighter Barrage, Destroyers receive one extra combat die and +2 to their rolls.",
        shortName: "AUT",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.automatedTurrets,
    },
    [Technology.WAR_SUN]: {
        name: "War Sun",
        description: "War Suns receive +2 combat dice during bombardment.",
        shortName: "WSN",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.warSun,
    },
    [Technology.GRAVITON_NETAGOR]: {
        name: "Graviton Negator",
        description: ["Receive +1 to all Bombardment rolls.", "Fighters and Cruisers receive Bombardment (x1)."],
        shortName: "GRN",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.gravitonNegator,
    },
    [Technology.MAGEN_DEFENSE_GRID]: {
        name: "Magen Defense Grid",
        description: [
            "+1 to combat rolls of PDS and ground units defending planets containing your PDS.",
            "Planetary Shields not used during Bombardment may now instead be used to cancel a hit during combat rounds of Invasion Combat.",
        ],
        shortName: "MAG",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.magenDefenseGrid,
    },
    [Technology.ASSAULT_CANNONS]: {
        name: "Assault Cannons",
        description: "Dreadnoughts and Cruisers receive Pre-combat shot (x1).",
        shortName: "ASC",
        color: technologyColors[TechnologyType.RED],
        type: TechnologyType.RED,
        implementation: effects.assaultCannons,
    },
    [Technology.GRAVITON_LASER_SYSTEM]: {
        name: "Graviton Laser System",
        description: "One of your PDS (Space Cannon) gains one extra combat roll.",
        shortName: "GLS",
        color: technologyColors[TechnologyType.YELLOW],
        type: TechnologyType.YELLOW,
        implementation: effects.gravitonLaserSystem,
    },
    [Technology.CYBERNETICS]: {
        name: "Cybernetics",
        description: "Fighters receive +1 to combat rolls.",
        shortName: "CYB",
        color: technologyColors[TechnologyType.GREEN],
        type: TechnologyType.GREEN,
        implementation: effects.cybernetics,
    },
    [Technology.GEN_SYNTHESIS]: {
        name: "Gen synthesis",
        description: "Ground Forces (and Shock Troops) receive +1 to Combat Rolls.",
        shortName: "GEN",
        color: technologyColors[TechnologyType.GREEN],
        type: TechnologyType.GREEN,
        implementation: effects.genSynthesis,
    },
    [Technology.X89_BACTERIAL_WEAPON]: {
        name: "X-89 bacterial weapon",
        description: "This technology is not yet implemented.",
        shortName: "X89",
        color: technologyColors[TechnologyType.GREEN],
        type: TechnologyType.GREEN,
        implementation: false,
    },
    [Technology.ADVANCED_FIGHTERS]: {
        name: "Advanced fighters",
        description: "Fighters receive +1 to combat rolls.",
        shortName: "ADF",
        color: technologyColors[TechnologyType.BLUE],
        type: TechnologyType.BLUE,
        implementation: effects.advancedFighters,
    },
    [Technology.MANEUVERING_JETS]: {
        name: "Maneuvering jets",
        description: "Space Cannon and Space Mine rolls against your ships receive -1.",
        shortName: "MNJ",
        color: technologyColors[TechnologyType.BLUE],
        type: TechnologyType.BLUE,
        implementation: effects.maneuveringJets,
    },
};
const factionAbilityResources: KeyedDictionary<FactionAbility, ParticipantTagResources> = {
    [FactionAbility.MENTAK_PRECOMBAT_SHOTS]: {
        name: "Ambush",
        description: "Grant Pre-combat shot (x1) to up to 2 of your ships that are Cruisers or Destroyers.",
        color: factionResources[Faction.MENTAK_COALITION].color,
        implementation: effects.mentakPreCombatShots,
    },
    [FactionAbility.NAALU_FIGHTER_MOD]: {
        name: "Graceful",
        description: "Your fighters receive +1 to all combat rolls.",
        color: factionResources[Faction.NAALU_COLLECTIVE].color,
        implementation: effects.naaluFighterMod,
    },
    [FactionAbility.SARDAKK_UNIT_MOD]: {
        name: "Ferocious",
        description: "Your units receive +1 to all combat rolls.",
        color: factionResources[Faction.HIVES_OF_SARDAKK_NORR].color,
        implementation: effects.sardakkUnitMod,
    },
    [FactionAbility.JOLNAR_UNIT_MOD]: {
        name: "Fragile",
        description: "Your units receive -1 to all combat rolls.",
        color: factionResources[Faction.UNIVERSITIES_OF_JOLNAR].color,
        implementation: effects.jolnarUnitMod,
    },
    [FactionAbility.JOLNAR_REROLL]: {
        name: "Discerning",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.UNIVERSITIES_OF_JOLNAR].color,
        implementation: false,
    },
    [FactionAbility.XXCHA_ROUND1_MOD]: {
        name: "Resilient",
        description:
            "When you are the defender in a Space Battle or Invasion Combat, enemy combat rolls receive -1 in the first combat round.",
        color: factionResources[Faction.XXCHA_KINGDOM].color,
        implementation: effects.xxchaRound1Mod,
    },
    [FactionAbility.YIN_ROUND2_SACRIFICE]: {
        name: "Sacrifice",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.YIN_BROTHERHOOD].color,
        implementation: false,
    },
    [FactionAbility.YIN_INVASION_CONVERSION]: {
        name: "Indoctrination",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.YIN_BROTHERHOOD].color,
        implementation: false,
    },
    [FactionAbility.LIZIX_DREADNOUGHT_MOD]: {
        name: "Tyrant Class",
        description: "Your Dreadnoughts receive +1 to all combat rolls.",
        color: factionResources[Faction.LIZIX_MINDNET].color,
        implementation: effects.lizixDreadnoughtMod,
    },
    [FactionAbility.LIZIX_GROUND_FORCE_MOD]: {
        name: "Augmented",
        description: [
            "Your Gound Forces and Shock Troops receive +1 to all combat rolls.",
            "When accompanying mechs as the attacker, they instead receive +2.",
        ],
        color: factionResources[Faction.LIZIX_MINDNET].color,
        implementation: effects.lizixGroundForceMod,
    },
    [FactionAbility.ARBOREC_GROUND_FORCE_MOD]: {
        name: "Deep Roots",
        description: "Your Ground Forces (and Shock Troops) receive -1 to all combat rolls.",
        color: factionResources[Faction.ARBOREC_ECOSYSTEM].color,
        implementation: effects.arborecGroundForceMod,
    },
};

const factionUpgradeResources: KeyedDictionary<FactionUpgrade, ParticipantTagResources> = {
    [FactionUpgrade.LETNEV_SAIMOC_INFUSED_HULLS]: {
        name: "Saimoc-Infused Hulls",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.BARONY_OF_LETNEV].color,
        implementation: false,
    },
    [FactionUpgrade.SAAR_CHAOS_MAPPING]: {
        name: "Chaos Mapping",
        description: "All pre-combat rolls receive -1 against you.",
        color: factionResources[Faction.CLAN_OF_SAAR].color,
        implementation: effects.saarChaosMapping,
    },
    [FactionUpgrade.SOL_ADVANCED_FLEET_TACTICS]: {
        name: "Advanced Fleet Tactics",
        description: [
            "During each combat round of Space Battles, up to three Fighters and one Carrier receive +2 to combat rolls.",
            "No more than half of your Fighters (round up) may be lost to Anti-Fighter Barrage.",
        ],
        color: factionResources[Faction.FEDERATION_OF_SOL].color,
        implementation: effects.solAdvancedFleetTactics,
    },
    [FactionUpgrade.SOL_MARK2_ADVANCED_CARRIERS]: {
        name: "Mark II Advanced Carriers",
        description: "Your Carriers gain Sustain Damage (x1).",
        color: factionResources[Faction.FEDERATION_OF_SOL].color,
        implementation: effects.solMark2AdvancedCarriers,
    },
    [FactionUpgrade.SOL_VERSATILE_COMBAT_TACTICS]: {
        name: "Versatile Combat Tactics",
        description: [
            "Your Ground Forces (and Shock Troops) gain +2 to combat rolls in combat rounds where you have fewer combat dice than the opponent.",
            "During enemy Bombardment, half of your Ground Forces (round up) are immune.",
        ],
        color: factionResources[Faction.FEDERATION_OF_SOL].color,
        implementation: effects.solVersatileCombatTactics,
    },
    [FactionUpgrade.MENTAK_ADAPTABLE_ORDNANCE_RIGS]: {
        name: "Adaptable Ordnance Rigs",
        description: [
            "Your Cruisers gain Capacity (1 Ground Force).",
            "During your actions, Cruisers not using this Capacity may either sustain damage outside of combat rounds, or make an extra combat roll in the first combat round of Space Battles.",
        ],
        color: factionResources[Faction.MENTAK_COALITION].color,
        implementation: effects.mentakAdaptableOrdnanceRigs,
    },
    [FactionUpgrade.SARDAKK_BERZERKER_GENOME]: {
        name: "Berzerker Genome",
        description: "In any combat round in which you score at least one hit, automatically inflict an extra hit on the opponent.",
        color: factionResources[Faction.HIVES_OF_SARDAKK_NORR].color,
        implementation: effects.sardakkBerzerkerGenome,
    },
    [FactionUpgrade.XXCHA_ARCHON_ENERGY_SHELL]: {
        name: "Archon Energy Shells",
        description: "As the defender in Space Combat or Invasion Combat, you may negate two hits.",
        color: factionResources[Faction.XXCHA_KINGDOM].color,
        implementation: effects.xxchaArchonEnergyShell,
    },
    [FactionUpgrade.YIN_BLADE_OF_ZEAL]: {
        name: "Blade of Zeal",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.YIN_BROTHERHOOD].color,
        implementation: false,
    },
    [FactionUpgrade.YIN_SUBLIMINAL_COMMAND]: {
        name: "Subliminal Command",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.YIN_BROTHERHOOD].color,
        implementation: false,
    },
    [FactionUpgrade.MUAAT_MAGMUS_REACTOR]: {
        name: "Magmus Reactor",
        description: "Your War Suns gain +1 to all combat rolls during actions in which they are leaving a Supernova.",
        color: factionResources[Faction.EMBERS_OF_MUAAT].color,
        implementation: effects.muaatMagmusReactor,
    },
    [FactionUpgrade.MUAAT_MAGMA_OBLITERATOR]: {
        name: "Magma Obliterator",
        description: "One of your War Sun gains Bombardment (x2).",
        color: factionResources[Faction.EMBERS_OF_MUAAT].color,
        implementation: effects.muaatMagmaObliterator,
    },
    [FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER]: {
        name: "Dimensional Splicer",
        description:
            "At the start of a Space Battle in a system containing a wormhole, inflict one hit to the opposing fleet which the opponent may not assign to Fighters.",
        color: factionResources[Faction.GHOSTS_OF_CREUSS].color,
        implementation: effects.creussDimensionalSplicer,
    },
    [FactionUpgrade.ORDER_CHRONOS_FIELD]: {
        name: "Chronos Field",
        description: "This ability is not yet implemented.",
        color: factionResources[Faction.ORDER_OF_THE_LAST].color,
        implementation: false,
    },
};

const commonParticipantTagResources: KeyedDictionary<CommonParticipantTag, ParticipantTagResources> = {
    [CommonParticipantTag.HIGH_ALERT_TOKEN]: {
        name: "High Alert Token",
        description: "Your units receive +1 to all combat rolls.",
        color: "white",
        implementation: effects.highAlertToken,
    },
    [CommonParticipantTag.GENERAL]: {
        name: "General",
        description: [
            "During Invasion Combat, your ground units receive +1 to combat rolls.",
            "In each combat round of Invasion Combat, you may reroll 2 friendly combat rolls (or the same roll twice).",
        ],
        color: "white",
        implementation: effects.general,
    },
    [CommonParticipantTag.AGENT]: {
        name: "Agent",
        description: "PDS (Invasion Defence) do not fire on your units.",
        color: "white",
        implementation: effects.agent,
    },
    [CommonParticipantTag.COMBAT_VALUE_MOD]: {
        name: "Combat Value Mod",
        description: "Manually modify the combat value of all units.",
        color: "white",
        implementation: effects.participantCombatValueMod,
    },
};

const combatTagResources: KeyedDictionary<CombatTag, ParticipantTagResources> = {
    [CombatTag.NEBULA]: {
        name: "Nebula",
        description: "During Space Battle, defending units receive +1 to all combat rolls.",
        color: "white",
        implementation: effects.nebula,
    },
    [CombatTag.ION_STORM]: {
        name: "Ion Storm",
        description: ["Fighters may not perform combat rolls.", "Space Cannon may not fire."],
        color: "white",
        implementation: effects.ionStorm,
    },
};

export const participantTagResources: KeyedDictionary<ParticipantTag, ParticipantTagResources> = {
    ...factionAbilityResources,
    ...factionUpgradeResources,
    ...technologyResources,
    ...commonParticipantTagResources,
    ...combatTagResources,
    // Flagship here is just a placeholder, to be replaced by faction-specific flagship implementations.
    [FlagshipTag.FLAGSHIP]: {
        name: "Flagship",
        description: "",
        color: "white",
        implementation: false,
    },
    [ConstantTag.PLANETARY_SHIELD]: {
        name: "Planetary Shield",
        description: "",
        color: "white",
        implementation: effects.planetaryShield,
    },
};

export const flagshipDefinitions: KeyedDictionary<Faction, FlagshipDefinition> = {
    [Faction.BARONY_OF_LETNEV]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Arc Secundus",
        combatValue: 5,
        combatRolls: 2,
        sustainDamage: 2,
        preCombatShots: 1,
        antiFigherBarrage: 1,
        bombardment: 1,
    },
    [Faction.CLAN_OF_SAAR]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Son of Ragh",
        combatValue: 7,
        combatRolls: 3,
        sustainDamage: 1,
        antiFigherBarrage: 2,
    },
    [Faction.EMIRATES_OF_HACAN]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Kenaran Sun",
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 2,
    },
    [Faction.FEDERATION_OF_SOL]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Genesis I",
        combatValue: 7,
        combatRolls: 2,
        sustainDamage: 2,
    },
    [Faction.MENTAK_COALITION]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Fourth Moon",
        combatValue: 4,
        combatRolls: 2,
        sustainDamage: 1,
        preCombatShots: 1,
    },
    [Faction.NAALU_COLLECTIVE]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "The Matriarch",
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 1,
        effect: effects.naaluFlagship,
        notes: "Protect half of your fighters against AFB",
    },
    [Faction.KROTOAN_VIRUS]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "The Alastor",
        combatValue: 6,
        combatRolls: 1,
        sustainDamage: 1,
        notes: "Reanimate a destroyed opposing ship after every round",
        nyi: true,
    },
    [Faction.HIVES_OF_SARDAKK_NORR]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "C'morran Norr",
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 1,
        spaceCannon: 1,
        effect: effects.sardakkFlagship,
        notes: "+1 to all combat rolls as attacker",
    },
    [Faction.UNIVERSITIES_OF_JOLNAR]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "J.N.S Hylarim",
        combatValue: 2,
        combatRolls: 1,
        sustainDamage: 1,
        notes: "Cancel opponent's technologies",
        nyi: true,
    },
    [Faction.WINNU_SOVEREIGNTY]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Salai Sai Corian",
        combatValue: 8,
        combatRolls: 4,
        sustainDamage: 1,
        notes: "Force opponent to reroll one die",
        nyi: true,
    },
    [Faction.XXCHA_KINGDOM]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Loncara Ssodu",
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 3,
    },
    [Faction.TRIBES_OF_YSSARIL]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Y'sia Y'ssrila",
        combatValue: 6,
        combatRolls: 1,
        sustainDamage: 1,
        preCombatShots: 3,
        effect: effects.yssarilFlagship,
        notes: "Fleet does not trigger space mines and space cannons",
    },
    [Faction.YIN_BROTHERHOOD]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Van Hauge",
        combatValue: 5,
        combatRolls: 2,
        sustainDamage: 1,
        antiFigherBarrage: 1,
        notes: "Ground forces on board function as fighters",
        nyi: true,
    },
    [Faction.EMBERS_OF_MUAAT]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "The Inferno",
        combatValue: 6,
        combatRolls: 1,
        sustainDamage: 1,
        antiFigherBarrage: 3,
        effect: effects.muaatFlagship,
        notes: "Has combat dice equal to the number of non-fighter ships in the opposing fleet",
    },
    [Faction.GHOSTS_OF_CREUSS]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Hil Colish",
        combatValue: 4,
        combatRolls: 1,
        sustainDamage: 1,
    },
    [Faction.LIZIX_MINDNET]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "0.0.1",
        combatValue: 5,
        combatRolls: 3,
        sustainDamage: 2,
        spaceCannon: 1,
        effect: effects.lizixFlagship,
        notes: "Hits must be taken by non-fighter ships",
    },
    [Faction.ARBOREC_ECOSYSTEM]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Duha Menaimon",
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 2,
    },
    [Faction.ORDER_OF_THE_LAST]: {
        ...unitDefinitions[UnitType.Flagship],
        flagshipName: "Last Chance",
        combatValue: 7,
        combatRolls: 2,
        sustainDamage: 1,
        antiFigherBarrage: 1,
        bombardment: 1,
    },
};

export const unitTagResources: KeyedDictionary<UnitTag, UnitTagResources> = {
    [UnitTag.ADMIRAL]: {
        name: "Admiral",
        implementation: effects.admiral,
    },
    [UnitTag.SCIENTIST]: {
        name: "Scientist",
        implementation: effects.scientist,
    },
    [UnitTag.KEEP_ALIVE]: {
        name: "Keep alive",
        implementation: false,
    },
    [UnitTag.COMBAT_VALUE_MOD]: {
        name: "Combat roll mod",
        implementation: effects.unitCombatValueMod,
    },
    [UnitTag.COMBAT_DICE_MOD]: {
        name: "Combat dice mod",
        implementation: effects.unitCombatDiceMod,
    },
};

export const combatStageResources: KeyedDictionary<CombatStage, CombatStageResources> = {
    [CombatStage.SpaceMines]: { name: "Space mines", shortName: "Mines" },
    [CombatStage.Bombardment]: { name: "Bombardment", shortName: "Bombard" },
    [CombatStage.SpaceCannon]: { name: "PDS fire", shortName: "PDS" },
    [CombatStage.InvasionDefence]: { name: "Invasion defense", shortName: "PDS" },
    [CombatStage.StartOfBattle]: { name: "Start of battle", shortName: "Start" },
    [CombatStage.AntiFighterBarrage]: { name: "Anti-fighter barrage", shortName: "AFB" },
    [CombatStage.PreCombat]: { name: "Pre-combat abilities", shortName: "Pre-combat" },
    [CombatStage.Round1]: { name: "Round 1", shortName: "Round 1" },
    [CombatStage.Round2]: { name: "Round 2", shortName: "Round 2" },
    [CombatStage.RoundN]: { name: "Round N", shortName: "Combat" },
};
