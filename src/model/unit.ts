import { getAllEnumValues } from "logic/common";
import { CombatType } from "./calculation";
import { Faction } from "./combatTags";
import { KeyedDictionary } from "./common";
import { ParticipantTagImplementation } from "./effects";

export enum UnitType {
    WarSun = 101,
    Dreadnought = 102,
    Cruiser = 103,
    Destroyer = 104,
    Carrier = 105,
    Fighter = 106,
    Flagship = 107,
    Mech = 111,
    GroundForce = 112,
    ShockTroop = 113,
    PDS = 121,
}

export const allUnitTypes: UnitType[] = getAllEnumValues<UnitType>(UnitType);

export interface UnitDefinition {
    type: UnitType;
    /**
     * 1-10
     * 1 = hits on all rolls
     * 10 = hits only on 10
     */
    combatValue: number;
    /**
     * Number of combat rolls in normal combat rounds.
     */
    combatRolls: number;
    sustainDamage: number;
    preCombatShots: number;
    /**
     * Number of AFB shots.
     */
    antiFigherBarrage: number;

    /**
     * Number of space cannon shots.
     */
    spaceCannon: number;

    /**
     * Number of bombardment shots.
     */
    bombardment: number;

    /**
     * Number of invasion defence shots.
     */
    invasionDefence: number;

    /**
     * Number of bombardment hits that can be sustained with planetary shield.
     */
    planetaryShield: number;

    name: string;

    /**
     * Types of combat the unit is a combatant in (meaning it acts in normal combat round and can be assigned hits).
     */
    combatantIn: CombatType[];

    imageSize: Dimensions;
    /**
     * Origin: bottom left
     */
    imageBadgeAnchor: Dimensions;
}

export interface FlagshipDefinition extends UnitDefinition {
    flagshipName: string;
    /**
     * Implementation of custom effects for the flagship.
     */
    effect?: ParticipantTagImplementation;
    /**
     * Describes special effects of the flagship.
     */
    notes?: string;

    /**
     * Indicates that the effect is not implemented.
     */
    nyi?: true;
}

export interface Dimensions {
    x: number;
    y: number;
}

export const unitDefinitions: KeyedDictionary<UnitType, UnitDefinition> = {
    [UnitType.WarSun]: {
        type: UnitType.WarSun,
        combatValue: 3,
        combatRolls: 3,
        sustainDamage: 2,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 1,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "War sun",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 80, y: 80 },
        imageBadgeAnchor: { x: 10, y: 20 },
    },
    [UnitType.Dreadnought]: {
        type: UnitType.Dreadnought,
        combatValue: 5,
        combatRolls: 2,
        sustainDamage: 1,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 1,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Dreadnought",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 100, y: 50 },
        imageBadgeAnchor: { x: 5, y: 10 },
    },
    [UnitType.Cruiser]: {
        type: UnitType.Cruiser,
        combatValue: 7,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Cruiser",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 50, y: 25 },
        imageBadgeAnchor: { x: 0, y: 5 },
    },
    [UnitType.Destroyer]: {
        type: UnitType.Destroyer,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 2,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Destroyer",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 40, y: 26 },
        imageBadgeAnchor: { x: 0, y: 5 },
    },
    [UnitType.Carrier]: {
        type: UnitType.Carrier,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Carrier",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 60, y: 21 },
        imageBadgeAnchor: { x: 0, y: 5 },
    },
    [UnitType.Fighter]: {
        type: UnitType.Fighter,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Fighter",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 20, y: 20 },
        imageBadgeAnchor: { x: 0, y: 0 },
    },
    [UnitType.Flagship]: {
        type: UnitType.Flagship,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Flagship",
        combatantIn: [CombatType.SpaceBattle],
        imageSize: { x: 100, y: 33 },
        imageBadgeAnchor: { x: 10, y: 10 },
    },
    [UnitType.Mech]: {
        type: UnitType.Mech,
        combatValue: 6,
        combatRolls: 2,
        sustainDamage: 1,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Mech",
        combatantIn: [CombatType.InvasionCombat],
        imageSize: { x: 40, y: 40 },
        imageBadgeAnchor: { x: 10, y: 10 },
    },
    [UnitType.GroundForce]: {
        type: UnitType.GroundForce,
        combatValue: 8,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Ground force",
        combatantIn: [CombatType.InvasionCombat],
        imageSize: { x: 20, y: 20 },
        imageBadgeAnchor: { x: 0, y: 0 },
    },
    [UnitType.ShockTroop]: {
        type: UnitType.ShockTroop,
        combatValue: 5,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 0,
        bombardment: 0,
        invasionDefence: 0,
        planetaryShield: 0,
        name: "Shock troop",
        combatantIn: [CombatType.InvasionCombat],
        imageSize: { x: 20, y: 20 },
        imageBadgeAnchor: { x: 0, y: 0 },
    },
    [UnitType.PDS]: {
        type: UnitType.PDS,
        combatValue: 6,
        combatRolls: 0,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
        spaceCannon: 1,
        bombardment: 0,
        invasionDefence: 1,
        planetaryShield: 1,
        name: "PDS",
        combatantIn: [],
        imageSize: { x: 40, y: 40 },
        imageBadgeAnchor: { x: 10, y: 10 },
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
        combatValue: 5,
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
        notes: "Protect half of your fighters against AFB",
        nyi: true,
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
        notes: "+1 to all combat rolls as attacker",
        nyi: true,
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
        notes: "Fleet does not trigger space mines and space cannons",
        nyi: true,
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
        notes: "Has combat dice equal to the number of non-fighter ships in the opposing fleet",
        nyi: true,
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
        notes: "Hits must be taken by non-fighter ships",
        nyi: true,
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
