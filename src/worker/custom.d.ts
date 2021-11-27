declare module "comlink-loader!*" {
    class WebpackWorker extends Worker {
        constructor();

        runCalculationWorker(attacker: Participant, defender: Participant): Promise<Outcome[]>;

        runSimulationWorker(attacker: CombatParticipant, defender: CombatParticipant, iterations: number): Promise<SimulatedCombatResult[]>;
    }

    export = WebpackWorker;
}
