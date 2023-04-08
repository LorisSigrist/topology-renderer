/// <reference types="vite/client" />
import RenderWorker from "./worker?worker&inline";
import type { TopologyRenderingOptions } from "./topology";
import { FullTopologyOptions } from ".";


export const topology = (canvas: HTMLCanvasElement, options : FullTopologyOptions) => {
    set_element_size(canvas, options.width, options.height);

    const rendering_options = get_rendering_options(options);
    const offscreen_canvas = canvas.transferControlToOffscreen();

    const worker = new RenderWorker();
    worker.postMessage({ type: "init", canvas: offscreen_canvas, options: rendering_options }, [offscreen_canvas]);

    return {
        update: (new_options: FullTopologyOptions) => {
            set_element_size(canvas, new_options.width, new_options.height);
            const rendering_options = get_rendering_options(new_options);
            worker.postMessage({ type: "update", options: rendering_options });

        },
        destroy: () => {
            worker.postMessage({ type: "destroy" });
            worker.terminate();
        }
    };

};

//Set canvas size - Dimensions are BEFORE scaling for device pixel ratio
function set_element_size(canvas: HTMLCanvasElement, width: number, height: number) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
}

function get_rendering_options(options: FullTopologyOptions): TopologyRenderingOptions {
    return {
        background_color: options.background_color,
        line_color: options.line_color,
        speed: options.speed,
        render_width: options.width * window.devicePixelRatio,
        render_height: options.height * window.devicePixelRatio
    };
}