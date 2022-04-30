import { UnitSnapshotTag } from "./combatState";
import { Faction, ParticipantTag, UnitTag } from "./combatTags";
import { KeyedDictionary, SparseDictionary } from "./common";
import { UnitType } from "./unit";

export enum CombatType {
    SpaceBattle = 1,
    InvasionCombat = 2,
}

export enum CombatStage {
    SpaceMines = 1,
    Bombardment = 2,
    SpaceCannon = 3,
    InvasionDefence = 4,
    StartOfBattle = 5,
    AntiFighterBarrage = 6,
    PreCombat = 7,
    Round1 = 8,
    Round2 = 9,
    RoundN = 10,
}

export const combatStagesByCombatType: KeyedDictionary<CombatType, CombatStage[]> = {
    [CombatType.SpaceBattle]: [
        CombatStage.SpaceMines,
        CombatStage.SpaceCannon,
        CombatStage.StartOfBattle,
        CombatStage.AntiFighterBarrage,
        CombatStage.PreCombat,
        CombatStage.Round1,
        CombatStage.Round2,
        CombatStage.RoundN,
    ],
    [CombatType.InvasionCombat]: [
        CombatStage.Bombardment,
        CombatStage.InvasionDefence,
        CombatStage.StartOfBattle,
        CombatStage.PreCombat,
        CombatStage.Round1,
        CombatStage.Round2,
        CombatStage.RoundN,
    ],
};

export const combatRoundStages: CombatStage[] = [CombatStage.Round1, CombatStage.Round2, CombatStage.RoundN];

export interface CombatStageResources {
    name: string;
    shortName: string;
}

export enum ParticipantRole {
    Attacker = "attacker",
    Defender = "defender",
}

export type CombatVictor = ParticipantRole.Attacker | ParticipantRole.Defender | "draw";

export interface CalculationInput {
    combatType: CombatType;
    [ParticipantRole.Attacker]: ParticipantInput;
    [ParticipantRole.Defender]: ParticipantInput;
    tags: ParticipantInputTags; // Global tags that apply to the combat
}

export interface CalculationOutput {
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
    finalStates: CombatStateProbabilityOutput[];
    stages: SparseDictionary<CombatStage, CombatStageOutput>;
    statistics: KeyedDictionary<ParticipantRole, CalculationOutputStatistics>;
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
export interface CombatStageParticipantStatistics extends StatisticsBase {
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

export interface CalculationOutputStatistics extends StatisticsBase {}

export interface StatisticsBase {
    /**
     * Statistics for surviving units for the participant.
     * The probability of all entries in the array shall sum to 1.0.
     */
    survivingUnitProbabilities: SurvivingUnitsStatistics[];
}

export interface SurvivingUnitsStatistics {
    units: UnitInput[];
    /**
     * Probability for this exact outcome.
     */
    probability: number;
    /**
     * Aggregated probability for this outcome or a better outcome (more surviving units).
     */
    probabilityThisOrBetter: number;
    /**
     * Aggregated probability for this outcome or a worse outcome (fewer surviving units).
     */
    probabilityThisOrWorse: number;
    totalHealth: number;
    sustainedHits: number;
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
    /**
     * This is currently only used to display used planetary shields in the casualty view.
     */
    usedPlanetaryShields?: number;
    tags?: UnitInputTags; // Leaders present on ships/PDS, AC's affecting a specific unit
}
export type UnitInputTags = SparseDictionary<UnitTag, any>;

export enum HitType {
    /**
     * Normal hit that can be assigned to any unit.
     */
    Normal = 0b0001,

    /**
     * Hit that can only be assigned to a fighter, for example from AFB.
     */
    AssignToFighter = 0b0010,

    /**
     * Hit that can only be assigned to a non-fighter, for example Dimensional Splicer
     */
    AssignToNonFighter = 0b0011,

    /**
     * Hit that must be assigned to a non-fighter if possible, for example L1z1x flagship
     */
    AssignToNonFighterFirst = 0b0100,
}

export const HIT_TYPE_BITMASK = 0b00111111;

export enum HitTypeFlags {
    /**
     * Flag applied to hits that are not caused by combat rolls (and thus can't be negated by e.g. Impulsion Shields)
     */
    NotCombatRoll = 0b01000000,
}

export const HIT_TYPE_AND_FLAGS_BITMASK = 0b0011111111;

export interface HitsProbabilityOutcome {
    hits: SparseDictionary<HitType, number>;
    probability: number;
}

export interface HitsProbabilityIntermediateOutcome {
    /**
     * Key: masked hit type, including unit combat strength
     */
    hits: SparseDictionary<number, HitCount>;
    probability: number;
}

export interface HitCount {
    hits: number;
    rolls: number;
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
     * Index of the unit in the redux state.
     */
    unitIndex: number;
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
    sustainDamage: number;
}
