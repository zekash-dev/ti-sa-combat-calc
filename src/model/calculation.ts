import { getAllEnumValues } from "logic/common";
import { UnitSnapshotTag } from "./combatState";
import { Faction, ParticipantTag, UnitTag } from "./combatTags";
import { KeyedDictionary, SparseDictionary } from "./common";
import { UnitType } from "./unit";

export enum CombatStage {
    SpaceMines = 1,
    PDS = 2,
    StartOfBattle = 3,
    AntiFighterBarrage = 4,
    PreCombat = 5,
    Round1 = 6,
    Round2 = 7,
    RoundN = 8,
}

export const allCombatStages: CombatStage[] = getAllEnumValues<CombatStage>(CombatStage);

export interface CombatStageResources {
    name: string;
    shortName: string;
}

export type IntermediateCombatStage = Omit<CombatStage, CombatStage.RoundN>;

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
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
    finalStates: CombatStateProbabilityOutput[];
    stages: SparseDictionary<CombatStage, CombatStageOutput>;
    // statesByStage: SparseDictionary<CombatStage, CombatStateProbabilityOutput[]>;
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

export interface CombatStageOutput {
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
    beforeStates: CombatStateProbabilityOutput[];
    afterStates: CombatStateProbabilityOutput[];
    statistics: KeyedDictionary<ParticipantRole, CombatStageParticipantStatistics>;
}

/**
 * Statistics for a participant in a single combat stage.
 */
export interface CombatStageParticipantStatistics {
    /**
     * Expected hits based on the participant's units.
     */
    expectedHits: number;
    /**
     * Average hits (weighted by probability) that were actually assigned to opponent units.
     *
     * This can differ from _expectedHits_ if all hits can't be assigned, or if the opponent uses abilities to cancel hits.
     */
    assignedHits: number;
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

export enum HitType {
    /**
     * Normal hit that can be assigned to any unit.
     */
    Normal = 1,

    /**
     * Hit that can only be assigned to a fighter, for example from AFB.
     */
    AssignToFighter = 2,
}

export interface HitsProbabilityOutcome {
    hits: SparseDictionary<HitType, number>;
    probability: number;
}

export interface RichParticipantsInput {
    [ParticipantRole.Attacker]: RichParticipant;
    [ParticipantRole.Defender]: RichParticipant;
}

export interface RichParticipant {
    faction: Faction;
    units: RichUnit[];
    tags: ParticipantInputTags; // techs, upgrades, AC's, PC's, ...
}

export interface RichUnit {
    /**
     * Base input.
     */
    input: UnitInput;
    /**
     * Baseline for the unit in normal combat rounds.
     * Undefined indicates the unit does nothing in normal combat rounds (for example a PDS).
     */
    baseline: UnitStageStats | undefined;
    /**
     * Describes additional stages when the unit acts (AFB, Pre-combat).
     * For Round1 and Round2, only describes if the unit differs from the baseline for these stages.
     */
    byStage: SparseDictionary<CombatStage, UnitStageStats>;
    /**
     * All tag effects that affect the unit's snapshot calculations.
     */
    tagEffects: UnitSnapshotTag[];
}

export interface UnitStageStats {
    /**
     * Array with one entry for each roll, describing the combat value of the roll.
     */
    rolls: number[];
    hitType: HitType;
}
