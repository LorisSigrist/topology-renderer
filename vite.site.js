//the vite config for building the static site
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl"

export default defineConfig({
    plugins: [glsl({
        compress: true
    })],
    build: {
        outDir: "site_dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "index.html",
            },
        },
    },
    worker: {
        plugins: [glsl({
            compress: true
        })]
    },
});