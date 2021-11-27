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

export interface Participant {
    faction: Faction;
    units: UnitMap;
}

export type UnitMap = SparseDictionary<UnitType, number>;

export type KeyedDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]: TValue;
};

export type SparseDictionary<TKey extends string | number | symbol, TValue> = {
    [key in TKey]?: TValue;
};

// Calculation
export interface CombatRoundInput {
    [ParticipantRole.Attacker]: Participant;
    [ParticipantRole.Defender]: Participant;
    initProbability: number;
    initAttackerHits: number;
    initDefenderHits: number;
    combatRound: number;
}

export interface OutcomeInstance {
    probability: number;
    victor: ParticipantRole | null;
    attackerHits: number;
    defenderHits: number;
    combatRounds: number;
}

export interface AggregatedOutcome {
    probability: number;
    victor: ParticipantRole | null;
    avgAttackerHits: number;
    avgDefenderHits: number;
    combatRounds: number;
}

export interface OutcomeRoundCount {
    count: number;
    probability: number;
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
