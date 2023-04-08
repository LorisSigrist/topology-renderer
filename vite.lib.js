//The vite config for building the library
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl"
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [glsl({
        compress: true
    }),dts()],
    build: {
        outDir: "lib_dist",
        lib: {
            entry: "lib/index.ts",
            formats: ["es"],
            fileName: "index",
        },
        minify: true,
        emptyOutDir: true,  
    },
    worker: {
        "format": "es",
        plugins: [glsl({
            compress: true
        })]
    },
});