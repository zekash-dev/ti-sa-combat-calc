import { CombatStage, PerformanceTracker, UnitType } from "./common";

export interface CombatStatePrototype {
    stage: CombatStage;
    attacker: ParticipantState;
    defender: ParticipantState;
}

export interface CombatStateOutput {
    stage: CombatStage;
    attacker: ParticipantStateOutput;
    defender: ParticipantStateOutput;
}

/**
 * Base "node" of a combat state. Hashable and equatable.
 * When new states are created, they should first be compared against existing states to see if they are equal.
 */
export class CombatState {
    stage: CombatStage;
    attacker: ParticipantState;
    defender: ParticipantState;
    performanceTracker: PerformanceTracker;
    hash: number;

    constructor({ stage, attacker, defender }: CombatStatePrototype, performanceTracker: PerformanceTracker) {
        this.stage = stage;
        this.attacker = attacker;
        this.defender = defender;
        this.performanceTracker = performanceTracker;
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        const p0 = performance.now();
        let hash: number = this.stage;
        hash = (hash << 5) - hash + this.attacker.hash;
        hash = (hash << 5) - hash + this.defender.hash * 2;
        this.performanceTracker.hashCombatState += performance.now() - p0;
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
        const p0 = performance.now();
        const ret = (() => {
            if (a.hash !== b.hash) return a.hash - b.hash;
            const attackerComparison: number = ParticipantState.compare(a.attacker, b.attacker);
            if (attackerComparison !== 0) return attackerComparison;
            const defenderComparison: number = ParticipantState.compare(a.defender, b.defender);
            if (defenderComparison !== 0) return defenderComparison;
            return 0;
        })();
        a.performanceTracker.combatStateComparer += performance.now() - p0;
        return ret;
    }
}

export interface ParticipantStatePrototype {
    tags: CombatStateTags;
    units: UnitState[];
}

export interface ParticipantStateOutput {
    tags: CombatStateTags;
    units: UnitStatePrototype[];
}

export class ParticipantState {
    units: UnitState[];
    tags: CombatStateTags;
    performanceTracker: PerformanceTracker;
    hash: number;

    constructor({ units, tags }: ParticipantStatePrototype, performanceTracker: PerformanceTracker) {
        this.units = [...units].sort(UnitState.compare);
        this.tags = tags;
        this.performanceTracker = performanceTracker;
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        const p0 = performance.now();
        let hash: number = 0;
        for (let unit of this.units) {
            hash = (hash << 5) - hash + unit.hash;
        }
        hash = (hash << 5) - hash + hashCombatStateTags(this.tags);
        this.performanceTracker.hashParticipantState += performance.now() - p0;
        return hash;
    }

    public toOutput(): ParticipantStateOutput {
        return {
            units: this.units.map((u) => u.toOutput()),
            tags: this.tags,
        };
    }

    public static compare(a: ParticipantState, b: ParticipantState): number {
        const p0 = performance.now();
        const ret = (() => {
            if (a.hash !== b.hash) return a.hash - b.hash;
            if (a.units.length !== b.units.length) return a.units.length - b.units.length;
            for (let i = 0; i < a.units.length; i++) {
                const comparison: number = UnitState.compare(a.units[i], b.units[i]);
                if (comparison !== 0) return comparison;
            }
            return compareCombatStateTags(a.tags, b.tags);
        })();
        a.performanceTracker.participantStateComparer += performance.now() - p0;
        return ret;
    }
}

export interface UnitStatePrototype {
    type: UnitType;
    sustainedHits?: number;
    tags?: CombatStateTags;
}

export class UnitState {
    type: UnitType;
    sustainedHits?: number;
    tags?: CombatStateTags;
    performanceTracker: PerformanceTracker;
    hash: number;

    constructor({ type, sustainedHits, tags }: UnitStatePrototype, performanceTracker: PerformanceTracker) {
        this.type = type;
        this.sustainedHits = sustainedHits;
        this.tags = tags;
        this.performanceTracker = performanceTracker ?? {};
        this.hash = this.calculateHash();
    }

    private calculateHash(): number {
        const p0 = performance.now();
        let hash: number = this.type;
        hash = (hash << 5) - hash + (this.sustainedHits ?? 0);
        hash = (hash << 5) - hash + hashCombatStateTags(this.tags);
        this.performanceTracker.hashUnitState += performance.now() - p0;
        return hash;
    }

    public sustainHit(): UnitState {
        return new UnitState({ type: this.type, sustainedHits: (this.sustainedHits ?? 0) + 1 }, this.performanceTracker);
    }

    public toOutput(): UnitStatePrototype {
        return {
            type: this.type,
            sustainedHits: this.sustainedHits,
            tags: this.tags,
        };
    }

    public static compare(a: UnitState, b: UnitState): number {
        const p0 = performance.now();
        const ret = (() => {
            if (a.hash !== b.hash) return a.hash - b.hash;
            if (a.type !== b.type) return a.type - b.type;
            if (a.sustainedHits !== b.sustainedHits) return (a.sustainedHits ?? 0) - (b.sustainedHits ?? 0);
            return compareCombatStateTags(a.tags, b.tags);
        })();
        a.performanceTracker.unitStateComparer += performance.now() - p0;
        return ret;
    }
}

export interface CombatStateTags {
    [key: number]: number;
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
