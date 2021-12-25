import { CalculationInput, CombatStage, HitType, ParticipantRole } from "./calculation";
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
    newTagState?: number | undefined;
    // newCombatState?: CombatState | undefined;
}

export interface ParticipantTagImplementation {
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
}

export interface UnitOnComputeSnapshotInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    stage: CombatStage;
    unit: ComputedUnitSnapshot;
}

export interface UnitTagImplementation {
    /**
     * Called when computing snapshots for the unit.
     */
    onComputeUnitSnapshot?: (input: UnitOnComputeSnapshotInput) => void;
}
