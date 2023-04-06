//The vite config for building the library
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl"

export default defineConfig({
    plugins: [glsl({
        compress: true
    })],
    build: {
        outDir: "lib_dist",
        lib: {
            entry: "lib/topology.js",
            formats: ["es"],
            fileName: "index",
        },
        //I don't like npm packages being minified
        //The user usually has a minifier in their build pipeline 
        //Let them do it
        minify: false 
    },
});