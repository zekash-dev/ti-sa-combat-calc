import { Dictionary } from "lodash";

import { CombatStage, CombatStateOutput, CombatStateTags, ParticipantInput, UnitInput } from "./calculation";
import { UnitType } from "./unit";

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

/**
 * Base "node" of a combat state. Hashable and equatable.
 * When new states are created, they should first be compared against existing states to see if they are equal.
 */
export class CombatState {
    stage: CombatStage;
    attacker: ParticipantState;
    defender: ParticipantState;
    hash: number;

    constructor(stage: CombatStage, attacker: ParticipantState, defender: ParticipantState) {
        this.stage = stage;
        this.attacker = attacker;
        this.defender = defender;
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        let hash: number = this.stage;
        hash = (hash << 5) - hash + this.attacker.hash;
        hash = (hash << 5) - hash + this.defender.hash * 2;
        return hash;
    }

    public toOutput(): CombatStateOutput {
        return {
            stage: this.stage,
            attacker: this.attacker.toOutput(),
            defender: this.defender.toOutput(),
        };
    }

    public static compare(a: CombatState, b: CombatState): number {
        if (a.hash !== b.hash) return a.hash - b.hash;
        const attackerComparison: number = ParticipantState.compare(a.attacker, b.attacker);
        if (attackerComparison !== 0) return attackerComparison;
        const defenderComparison: number = ParticipantState.compare(a.defender, b.defender);
        if (defenderComparison !== 0) return defenderComparison;
        return 0;
    }
}

export class ParticipantState {
    units: UnitState[];
    tags: CombatStateTags;
    hash: number;

    constructor(units: UnitState[], tags: CombatStateTags) {
        this.units = [...units].sort();
        this.tags = tags;
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        let hash: number = 0;
        for (let unit of this.units) {
            hash = (hash << 5) - hash + unit.hash;
        }
        hash = (hash << 5) - hash + hashCombatStateTags(this.tags);
        return hash;
    }

    public toOutput(): ParticipantInput {
        return {
            units: this.units.map((u) => u.toOutput()),
            tags: this.tags,
        };
    }

    public static compare(a: ParticipantState, b: ParticipantState): number {
        if (a.hash !== b.hash) return a.hash - b.hash;
        if (a.units.length !== b.units.length) return a.units.length - b.units.length;
        for (let i = 0; i < a.units.length; i++) {
            const comparison: number = UnitState.compare(a.units[i], b.units[i]);
            if (comparison !== 0) return comparison;
        }
        return compareCombatStateTags(a.tags, b.tags);
    }
}

export class UnitState {
    type: UnitType;
    sustainedHits: number;
    tags?: CombatStateTags;
    hash: number;

    constructor(type: UnitType, sustainedHits: number, tags: CombatStateTags | undefined) {
        this.type = type;
        this.sustainedHits = sustainedHits;
        this.tags = tags;
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        let hash: number = this.type;
        hash = (hash << 5) - hash + this.sustainedHits;
        hash = (hash << 5) - hash + hashCombatStateTags(this.tags);
        return hash;
    }

    public toOutput(): UnitInput {
        return {
            type: this.type,
            sustainedHits: this.sustainedHits,
            tags: this.tags,
        };
    }

    public static compare(a: UnitState, b: UnitState): number {
        if (a.hash !== b.hash) return a.hash - b.hash;
        if (a.type !== b.type) return a.type - b.type;
        if (a.sustainedHits !== b.sustainedHits) return a.sustainedHits - b.sustainedHits;
        return compareCombatStateTags(a.tags, b.tags);
    }
}

export interface ComputedUnitSnapshot {
    base: UnitState;
    type: UnitType;
    combatValue: number;
    rolls: number;
    sustainDamage: number;
    sustainedHits: number;
}

function hashCombatStateTags(tags: CombatStateTags | undefined): number {
    if (tags === undefined) return 0;
    let hash: number = 0;
    for (let key of Object.keys(tags).sort()) {
        const nKey: number = Number(key);
        hash = (hash << 5) - hash + nKey;
        hash = (hash << 5) - hash + tags[nKey];
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function compareCombatStateTags(a: CombatStateTags | undefined, b: CombatStateTags | undefined): number {
    if (a || b) {
        if (!a || !b) return Number(!!a) - Number(!!b);
        const aKeys: string[] = Object.keys(a);
        const bKeys: string[] = Object.keys(b);
        if (aKeys.length !== bKeys.length) return aKeys.length - bKeys.length;
        for (let key of aKeys) {
            const nKey = Number(key);
            if (a[nKey] !== b[nKey]) return (a[nKey] ?? 0) - (b[nKey] ?? 0);
        }
    }
    return 0;
}
