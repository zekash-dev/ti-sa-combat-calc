import { getAllEnumValues } from "logic/common";
import { ParticipantTagImplementation, UnitTagImplementation } from "./effects";

export enum Faction {
    BARONY_OF_LETNEV = 101,
    CLAN_OF_SAAR = 102,
    EMIRATES_OF_HACAN = 103,
    FEDERATION_OF_SOL = 104,
    MENTAK_COALITION = 105,
    NAALU_COLLECTIVE = 106,
    KROTOAN_VIRUS = 107,
    HIVES_OF_SARDAKK_NORR = 108,
    UNIVERSITIES_OF_JOLNAR = 109,
    WINNU_SOVEREIGNTY = 110,
    XXCHA_KINGDOM = 111,
    TRIBES_OF_YSSARIL = 112,
    YIN_BROTHERHOOD = 113,
    EMBERS_OF_MUAAT = 114,
    GHOSTS_OF_CREUSS = 115,
    LIZIX_MINDNET = 116,
    ARBOREC_ECOSYSTEM = 117,
    ORDER_OF_THE_LAST = 118,
}

export enum FactionAbility {
    MENTAK_PRECOMBAT_SHOTS = 201,
    NAALU_FIGHTER_MOD = 202,
    SARDAKK_UNIT_MOD = 203,
    JOLNAR_UNIT_MOD = 204,
    JOLNAR_REROLL = 205,
    XXCHA_ROUND1_MOD = 206,
    YIN_ROUND2_SACRIFICE = 207,
    YIN_INVASION_CONVERSION = 208,
    LIZIX_DREADNOUGHT_MOD = 209,
    LIZIX_GROUND_FORCE_MOD = 210,
    ARBOREC_GROUND_FORCE_MOD = 211,
}

export enum FactionUpgrade {
    LETNEV_SAIMOC_INFUSED_HULLS = 301,
    SAAR_CHAOS_MAPPING = 302,
    SOL_ADVANCED_FLEET_TACTICS = 303,
    SOL_MARK2_ADVANCED_CARRIERS = 304,
    SOL_VERSATILE_COMBAT_TACTICS = 305,
    MENTAK_ADAPTABLE_ORDNANCE_RIGS = 306,
    SARDAKK_BERZERKER_GENOME = 307,
    XXCHA_ARCHON_ENERGY_SHELL = 308,
    YIN_BLADE_OF_ZEAL = 309,
    YIN_SUBLIMINAL_COMMAND = 310,
    MUAAT_MAGMUS_REACTOR = 311,
    MUAAT_MAGMA_OBLITERATOR = 312,
    CREUSS_DIMENSIONAL_SPLICER = 313,
    ORDER_CHRONOS_FIELD = 314,
}

export enum TechnologyType {
    BLUE = "blue",
    GREEN = "green",
    RED = "red",
    YELLOW = "yellow",
}

export enum Technology {
    HYLAR_V_LASER = 401,
    IMPULSION_SHIELDS = 402,
    AUTOMATED_TURRETS = 403,
    WAR_SUN = 404,
    GRAVITON_NETAGOR = 405,
    MAGEN_DEFENSE_GRID = 406,
    ASSAULT_CANNONS = 407,
    GRAVITON_LASER_SYSTEM = 408,
    CYBERNETICS = 409,
    GEN_SYNTHESIS = 410,
    X89_BACTERIAL_WEAPON = 412,
    ADVANCED_FIGHTERS = 413,
    MANEUVERING_JETS = 414,
}

export enum CommonParticipantTag {
    HIGH_ALERT_TOKEN = 501,
    GENERAL = 502,
    AGENT = 503,
}

export enum FlagshipTag {
    FLAGSHIP = 601,
}

export enum ConstantTag {
    PLANETARY_SHIELD = 701,
}

export const technologies: Technology[] = getAllEnumValues<Technology>(Technology);

export type ParticipantTag = FactionAbility | FactionUpgrade | Technology | CommonParticipantTag | FlagshipTag | ConstantTag;

export enum UnitTag {
    ADMIRAL = 901,
    SCIENTIST = 902,
    /**
     * Prioritize destroying other units when assigning hits.
     * The unit will still sustain hits when possible.
     */
    KEEP_ALIVE = 903,
}

export interface UnitTagResources {
    name: string;
    implementation: false | UnitTagImplementation;
}

export interface FactionResources {
    name: string;
    letter: string;
    icon?: JSX.Element;
    color: string;
}

export interface ParticipantTagResources {
    name: string;
    icon?: JSX.Element;
    color: string;
    implementation: false | ParticipantTagImplementation;
}

export interface TechnologyResources extends ParticipantTagResources {
    type: TechnologyType;
    shortName: string;
}
