import { getAllEnumValues } from "logic/common";
import { KeyedDictionary } from "./common";

export enum UnitType {
    WarSun = 101,
    Dreadnought = 102,
    Cruiser = 103,
    Destroyer = 104,
    Carrier = 105,
    Fighter = 106,
    Flagship = 107,
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

    name: string;
    imageSize: Dimensions;
    /**
     * Origin: bottom left
     */
    imageBadgeAnchor: Dimensions;
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
        name: "War sun",
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
        name: "Dreadnought",
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
        name: "Cruiser",
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
        name: "Destroyer",
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
        name: "Carrier",
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
        name: "Fighter",
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
        name: "Flagship",
        imageSize: { x: 100, y: 33 },
        imageBadgeAnchor: { x: 10, y: 10 },
    },
};
