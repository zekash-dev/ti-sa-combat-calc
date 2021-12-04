import { KeyedDictionary } from "./common";
import { UnitType } from "./unit";

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

export enum ParticipantRole {
    Attacker = "attacker",
    Defender = "defender",
}

export type CombatVictor = ParticipantRole.Attacker | ParticipantRole.Defender | "draw";

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

export interface CombatStateOutput {
    stage: CombatStage;
    attacker: ParticipantInput;
    defender: ParticipantInput;
}

export interface ParticipantInput {
    units: UnitInput[];
    tags: CombatStateTags; // techs, upgrades, AC's, PC's, ...
}

export interface UnitInput {
    type: UnitType;
    sustainedHits: number;
    tags?: CombatStateTags;
}

/**
 * All tags in CombatState need to be easy to hash and equate.
 * Implement as number keys and number values.
 */
export interface CombatStateTags {
    [key: number]: number;
}
