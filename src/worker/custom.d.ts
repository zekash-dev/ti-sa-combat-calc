declare module "comlink-loader!*" {
    class WebpackWorker extends Worker {
        constructor();

        runCalculationWorker(input: CalculationInput): Promise<CalculationOutput>;

        runSimulationWorker(attacker: CombatParticipant, defender: CombatParticipant, iterations: number): Promise<SimulatedCombatResult[]>;
    }

    export = WebpackWorker;
}
