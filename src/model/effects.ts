import { CalculationInput, CombatStage, ParticipantRole } from "./calculation";
import { CombatState, ComputedUnitSnapshot } from "./combatState";

export interface ParticipantOnComputeSnapshotInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    stage: CombatStage;
    units: ComputedUnitSnapshot[];
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
