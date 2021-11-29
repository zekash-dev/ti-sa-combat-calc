import { Dictionary } from "lodash";

export type KeyedDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]: TValue;
};

export type SparseDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]?: TValue;
};

export enum UnitType {
    WarSun = "warSun",
    Dreadnought = "dreadnought",
    Cruiser = "cruiser",
    Destroyer = "destroyer",
    Carrier = "carrier",
    Fighter = "fighter",
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
     * Number of combat rolls. Undefined = 1.
     */
    combatRolls?: number;
    sustainDamage?: number;
    preCombatShots?: number;
    /**
     * Number of AFB shots. Undefined = 0.
     */
    antiFigherBarrage?: number;
}

export enum Faction {
    JolNar = "jolnar",
    Hacan = "hacan",
    Creuss = "creuss",
    Sardakk = "sardakk",
}

export enum ParticipantRole {
    Attacker = "attacker",
    Defender = "defender",
}

export type CombatVictor = ParticipantRole.Attacker | ParticipantRole.Defender | "draw" | "timeout";

// Calculation
export enum CombatStage {
    SpaceMines = "sm",
    PDS = "pds",
    StartOfBattle = "sob",
    PreCombat = "pc",
    AntiFighterBarrage = "afb",
    Round1 = "r1",
    Round2 = "r2",
    RoundN = "rN",
}

/**
 * Key = hash of CombatState
 * Value = all states with the same hash (since hash doesn't guarantee uniqueness) and their respective probability
 */
export type CombatStateDictionary = Dictionary<CombatStateProbability[]>;

export interface CombatStateProbability {
    state: CombatState;
    probability: number;
}

/**
 * Base "node" of a combat state. Hashable and equatable.
 * When new states are created, they should first be compared against existing states to see if they are equal.
 */
export interface CombatState {
    stage: CombatStage;
    [ParticipantRole.Attacker]: ParticipantState;
    [ParticipantRole.Defender]: ParticipantState;
}

export interface ParticipantState {
    tags: any; // placeholder to keep track of spent abilities etc.
    units: UnitState[];
}

export interface UnitState {
    type: UnitType;
    sustainedHits?: number;
    tags?: CombatStateTags; // placeholder to keep track of spent abilities etc.
}

export interface CalculationInput {
    [ParticipantRole.Attacker]: ParticipantInput;
    [ParticipantRole.Defender]: ParticipantInput;
}

export interface CalculationOutput {
    victorProbabilites: KeyedDictionary<CombatVictor, number>;
    resultStates: CombatStateProbability[];
}

export interface ParticipantInput {
    faction: Faction;
    units: UnitState[];
    tags: CombatStateTags; // techs, upgrades, AC's, PC's, ...
}

/**
 * All tags in CombatState need to be easy to hash and equate.
 * Implement as string keys and number values.
 */
export interface CombatStateTags {
    [key: string]: number;
}

/**
 * Computed snapshot that takes has applied the bonus effect of all tags to the unit state.
 */
export interface ComputedUnitSnapshot extends UnitDefinition, UnitState {}

// Simulation

export interface SimulatedCombatResult extends SimulatedCombat {
    victor: CombatVictor;
}

export interface SimulatedCombat {
    rounds: number;
    attacker: CombatParticipant;
    defender: CombatParticipant;
}

export interface CombatParticipants {
    [ParticipantRole.Attacker]: CombatParticipant;
    [ParticipantRole.Defender]: CombatParticipant;
}

export interface CombatParticipant {
    faction: Faction;
    units: CombatUnit[];
}

// CombatUnit should be "pre-baked" with all its buffs (techs, racials etc.)
export interface CombatUnit extends UnitDefinition {
    alive: boolean;
    sustainedHits?: number;
    scoredHits: HitType[];
}

export interface AssignedHit {
    type: HitType;
    targetUnitType: UnitType;
}

export interface RolledHit {
    source: UnitType;
    type: HitType;
}

export enum HitType {
    Standard = "standard",
    PreCombat = "preCombat",
    AntiFighterBarrage = "antiFighterBarrage",
    // Yin suicide
    // Creuss splicer
    // Berserker genome
}

export interface AggregatedCombatResult {
    probability: number;
    victor: CombatVictor;
    // avgAttackerHits: number;
    // avgDefenderHits: number;
    // avgCombatRounds: number;
    // combatRoundBreakdown: CountProbability[];
}

export interface CountProbability {
    count: number;
    probability: number;
}
