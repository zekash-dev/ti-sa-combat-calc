import { Faction, ParticipantTag, UnitTag } from "./combatTags";
import { KeyedDictionary, SparseDictionary } from "./common";
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
    faction: Faction;
    units: UnitInput[];
    tags: ParticipantInputTags; // techs, upgrades, AC's, PC's, ...
}

export type ParticipantInputTags = SparseDictionary<ParticipantTag, any>;

export interface UnitInput {
    type: UnitType;
    sustainedHits: number;
    tags?: UnitInputTags; // Leaders present on ships/PDS, AC's affecting a specific unit
}
export type UnitInputTags = SparseDictionary<UnitTag, any>;
