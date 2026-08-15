import * as Comlink from "comlink";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

export default Comlink.wrap<typeof import("./worker")>(worker);
