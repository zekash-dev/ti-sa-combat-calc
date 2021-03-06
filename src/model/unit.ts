import { getAllEnumValues } from "logic/common";
import { CombatType } from "./calculation";
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

    letter: string;

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
        letter: "w",
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
        letter: "n",
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
        letter: "u",
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
        letter: "d",
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
        letter: "c",
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
        letter: "f",
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
        letter: "h",
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
        letter: "m",
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
        letter: "g",
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
        letter: "t",
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
        letter: "p",
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
        imageBadgeAnchor: { x: 0, y: 5 },
    },
};
