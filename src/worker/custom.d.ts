declare module "comlink-loader!*" {
    class WebpackWorker extends Worker {
        constructor();

        runCalculationWorker(input: CalculationInput): Promise<CalculationOutput>;
    }

    export = WebpackWorker;
}
