import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

export default defineConfig({
    base: "/games/SA/CombatCalculator/",
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    define: {
        "import.meta.env.VITE_BUILD_TIMESTAMP": JSON.stringify(Date.now()),
        "import.meta.env.VITE_VERSION": JSON.stringify(packageJson.version),
    },
});
