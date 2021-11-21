export enum UnitType {
    Fighter = "fighter",
    Destroyer = "destroyer",
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
