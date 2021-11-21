declare module "comlink-loader!*" {
    class WebpackWorker extends Worker {
        constructor();

        runCalculationWorker(attacker: Participant, defender: Participant): Promise<Outcome[]>;
    }

    export = WebpackWorker;
}
