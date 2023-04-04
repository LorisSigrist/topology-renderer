//The vite config for building the library
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "lib_dist",
        lib: {
            entry: "lib/topology.js",
            formats: ["es"],
            fileName: "index",
        }
    },
});