import { Dictionary } from "lodash";

import { CombatState, CombatStateOutput, UnitState, UnitStatePrototype } from "./combatState";

export type KeyedDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]: TValue;
};

export type SparseDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]?: TValue;
};

export enum UnitType {
    WarSun = 101,
    Dreadnought = 102,
    Cruiser = 103,
    Destroyer = 104,
    Carrier = 105,
    Fighter = 106,
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
    SpaceMines = 1,
    PDS = 2,
    StartOfBattle = 3,
    PreCombat = 4,
    AntiFighterBarrage = 5,
    Round1 = 6,
    Round2 = 7,
    RoundN = 8,
}

/**
 * Key = hash of CombatState
 * Value = all states with the same hash (since hash doesn't guarantee uniqueness) and their respective probability
 */
export type CombatStateDictionary = Dictionary<CombatStateProbability[]>;

/**
 * Key = hash of CombatState
 * Value = known resolutions for an input state
 */
export type CombatStateResolutionDictionary = Dictionary<CombatStateResolution[]>;

export interface CombatStateResolution {
    input: CombatState;
    nextStates: CombatStateProbability[];
}

export interface CombatStateProbability {
    state: CombatState;
    probability: number;
}

export interface CalculationInput {
    [ParticipantRole.Attacker]: ParticipantInput;
    [ParticipantRole.Defender]: ParticipantInput;
}

export interface CalculationOutput {
    victorProbabilites: KeyedDictionary<CombatVictor, number>;
    resultStates: CombatStateProbabilityOutput[];
}

export interface CombatStateProbabilityOutput {
    state: CombatStateOutput;
    probability: number;
}

export interface ParticipantInput {
    faction: Faction;
    units: UnitStatePrototype[];
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
export interface ComputedUnitSnapshot extends UnitDefinition, UnitStatePrototype {
    base: UnitState;
}

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

export interface PerformanceTracker {
    calculateCombatOutcome: number;
    getInitialState: number;
    resolveState: number;
    resolveCombatRound: number;
    appendCombatStateProbability: number;
    popNextActiveState: number;
    addMemoizedResolutions: number;
    assignHit: number;
    getUnitSnapshot: number;
    sortUnitsByPriorityOrder: number;
    resolveHit: number;
    calculateHits: number;
    mergeIdenticalStates: number;
    combatStateComparer: number;
    hashCombatState: number;
    participantStateComparer: number;
    hashParticipantState: number;
    unitStateComparer: number;
    hashUnitState: number;
    getMemoizedResolutions: number;
    computeNextStates: number;
    hashCollissions: number;
    memoizedResolutions: number;
    calculatedResolutions: number;
}
