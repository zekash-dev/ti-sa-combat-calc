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

export interface Outcome {
    probability: number;
    victor: ParticipantRole | null;
    hits: number[];
}
