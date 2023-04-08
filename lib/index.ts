/// <reference types="vite/client" />
import RenderWorker from "./worker?worker&inline";
import type { TopologyRenderingOptions } from "./topology";


interface FullTopologyOptions {
    background_color: [number, number, number];
    line_color: [number, number, number];
    speed: number;
    width: number;
    height: number;
}

export type TopologyOptions = Partial<FullTopologyOptions>;

const DEFAULT_OPTIONS: FullTopologyOptions = {
    background_color: [0, 22, 37],
    line_color: [41, 56, 76],
    speed: 1,
    width: 300,
    height: 150,
};

export const topology = (canvas: HTMLCanvasElement, partial_options: TopologyOptions = {}) => {
    const options = { ...DEFAULT_OPTIONS, ...partial_options };
    set_element_size(canvas, options.width, options.height);

    const rendering_options = get_rendering_options(options);
    const offscreen_canvas = canvas.transferControlToOffscreen();

    const worker = new RenderWorker();
    worker.postMessage({ type: "init", canvas: offscreen_canvas, options: rendering_options }, [offscreen_canvas]);

    return {
        update: (new_partial_options: TopologyOptions) => {
            const new_options = { ...DEFAULT_OPTIONS, ...new_partial_options };
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

function get_rendering_options(options: TopologyOptions): TopologyRenderingOptions {
    return {
        background_color: options.background_color,
        line_color: options.line_color,
        speed: options.speed,
        render_width: options.width * window.devicePixelRatio,
        render_height: options.height * window.devicePixelRatio
    };
}