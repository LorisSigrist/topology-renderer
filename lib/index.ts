import RenderWorker from "./worker?worker";
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


    //Set canvas size - Dimensions are BEFORE scaling for device pixel ratio
    const set_element_properties = (width: number, height: number) => {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    set_element_properties(options.width, options.height);

    const rendering_options: TopologyRenderingOptions = {
        background_color: options.background_color,
        line_color: options.line_color,
        speed: options.speed,
        render_width: options.width * window.devicePixelRatio,
        render_height: options.height * window.devicePixelRatio
    }

    // Get offscreen canvas
    const offscreen_canvas = canvas.transferControlToOffscreen();

    // Initialize worker
    const worker = new RenderWorker();

    // Transfer canvas to worker and initialize
    worker.postMessage({ type: "init", canvas: offscreen_canvas, options: rendering_options }, [offscreen_canvas]);

    return {
        update: (new_partial_options: TopologyOptions) => {
            const new_options = { ...DEFAULT_OPTIONS, ...new_partial_options };
            set_element_properties(new_options.width, new_options.height);

            const rendering_options: TopologyRenderingOptions = {
                background_color: new_options.background_color,
                line_color: new_options.line_color,
                speed: new_options.speed,
                render_width: new_options.width * window.devicePixelRatio,
                render_height: new_options.height * window.devicePixelRatio
            }
            
            worker.postMessage({ type: "update", options: rendering_options });
        },
        destroy: () => {
            worker.postMessage({ type: "destroy" });
            worker.terminate();
        }
    };
};