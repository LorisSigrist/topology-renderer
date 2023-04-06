//The vite config for building the library
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl"
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [glsl({
        compress: true
    }),
    dts()],
    build: {
        outDir: "lib_dist",
        lib: {
            entry: "lib/index.js",
            formats: ["es"],
            fileName: "index",
        },
        //I don't like npm packages being minified
        //The user usually has a minifier in their build pipeline 
        //Let them do it
        minify: false,
        emptyOutDir: true,
    },
});