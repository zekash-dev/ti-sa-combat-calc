import { CalculationInput, CombatStage, ParticipantRole } from "./calculation";
import { CombatState, ComputedUnitSnapshot } from "./combatState";

export interface UnitTagImplementation {
    onComputeSnapshot?: (unitSnapshot: ComputedUnitSnapshot) => void;
}

export interface ParticipantOnComputeSnapshotInput {
    calculationInput: CalculationInput;
    combatState: CombatState;
    role: ParticipantRole;
    stage: CombatStage;
    units: ComputedUnitSnapshot[];
}

export interface ParticipantTagImplementation {
    onComputeUnitSnapshots?: (input: ParticipantOnComputeSnapshotInput) => void;
}
