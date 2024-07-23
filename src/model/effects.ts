import { CalculationInput, CombatStage, HitsProbabilityIntermediateOutcome, HitType, ParticipantRole } from "./calculation";
import { CombatState, ComputedUnitSnapshot } from "./combatState";
import { SparseDictionary } from "./common";

export interface ParticipantOnComputeSnapshotInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    stage: CombatStage;
    units: ComputedUnitSnapshot[];
}

export interface PreAssignHitsInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    units: ComputedUnitSnapshot[];
    hits: SparseDictionary<HitType, number>;
    tagState: number | undefined;
}

export interface PreAssignHitsOutput {
    newHits?: SparseDictionary<HitType, number>;
    newUnits?: ComputedUnitSnapshot[];
    newTagState?: number | undefined;
    // newCombatState?: CombatState | undefined;
}

export interface OnCalculateHitsInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    outcome: HitsProbabilityIntermediateOutcome;
    tagState: number | undefined;
}

export interface OnCalculateHitsOutput {
    newOutcomes?: HitsProbabilityIntermediateOutcome[];
}

export interface ParticipantTagSettings<T> {
    default: T;
    encode: (settings: T) => string;
    decode: (str: string) => T;
}

export interface ParticipantTagCustomSettingsUiProps<T = any> {
    settings: T;
    onSettingsChange: (newSettings: T) => void;
}

export interface ParticipantTagImplementation<T = any> {
    /**
     * Called when computing snapshots for your own units.
     */
    onComputeUnitSnapshots?: (input: ParticipantOnComputeSnapshotInput) => void;

    /**
     * Called when computing snapshots for your opponent's units.
     *
     * 'role' in the input describes the tag owner's role, not the opponent's role.
     */
    onComputeOpponentUnitSnapshots?: (input: ParticipantOnComputeSnapshotInput) => void;

    /**
     * Called before assigning hits to your own units.
     */
    preAssignHits?: (input: PreAssignHitsInput) => PreAssignHitsOutput;

    /**
     * Called before your opponent assigns hits to their units.
     *
     * 'role' in the input describes the tag owner's role, not the opponent's role.
     */
    preAssignOpponentHits?: (input: PreAssignHitsInput) => PreAssignHitsOutput;

    /**
     * Called when calculating hits, for each possible outcome of combat rolls.
     */
    onCalculateHits?: (input: OnCalculateHitsInput) => OnCalculateHitsOutput;

    /**
     * Custom settings for the tag
     */
    settings?: ParticipantTagSettings<T>;
}

export interface UnitOnComputeSnapshotInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    stage: CombatStage;
    unit: ComputedUnitSnapshot;
}

export interface UnitTagImplementation<T = any> {
    /**
     * Called when computing snapshots for the unit.
     */
    onComputeUnitSnapshot?: (input: UnitOnComputeSnapshotInput) => void;

    /**
     * Custom settings for the tag
     */
    settings?: UnitTagSettings<T>;
}

export interface UnitTagSettings<T> {
    default: T;
    encode: (settings: T) => string;
    decode: (str: string) => T;
}
