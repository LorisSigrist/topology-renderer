//the vite config for building the static site
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "site_dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "index.html",
            },
        },
    },
});