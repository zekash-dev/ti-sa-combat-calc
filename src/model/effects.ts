import { ComputedUnitSnapshot } from "./combatState";

export interface UnitTagImplementation {
    onComputeSnapshot?: (unitSnapshot: ComputedUnitSnapshot) => void;
}

export interface ParticipantOnComputeSnapshotInput {
    units: ComputedUnitSnapshot[];
}

export interface ParticipantTagImplementation {
    onComputeUnitSnapshots?: (input: ParticipantOnComputeSnapshotInput) => void;
}
