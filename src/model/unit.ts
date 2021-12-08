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
}

export const unitDefinitions: KeyedDictionary<UnitType, UnitDefinition> = {
    [UnitType.WarSun]: {
        type: UnitType.WarSun,
        combatValue: 3,
        combatRolls: 3,
        sustainDamage: 2,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
    [UnitType.Dreadnought]: {
        type: UnitType.Dreadnought,
        combatValue: 5,
        combatRolls: 2,
        sustainDamage: 1,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
    [UnitType.Cruiser]: {
        type: UnitType.Cruiser,
        combatValue: 7,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
    [UnitType.Destroyer]: {
        type: UnitType.Destroyer,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 2,
    },
    [UnitType.Carrier]: {
        type: UnitType.Carrier,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
    [UnitType.Fighter]: {
        type: UnitType.Fighter,
        combatValue: 9,
        combatRolls: 1,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
    [UnitType.Flagship]: {
        type: UnitType.Flagship,
        combatValue: 0,
        combatRolls: 0,
        sustainDamage: 0,
        preCombatShots: 0,
        antiFigherBarrage: 0,
    },
};
