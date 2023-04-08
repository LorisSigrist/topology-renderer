import { topology as topology_optimized  } from "./optimized";
import { topology as topology_fallback } from "./fallback";

export interface FullTopologyOptions {
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

export function topology(canvas: HTMLCanvasElement, options: TopologyOptions) {
    const full_options = { ...DEFAULT_OPTIONS, ...options };

    let update = (options: FullTopologyOptions) => {};
    let destroy = () => {};

    if(supports_offscreen_and_worker()) {
        const optimized = topology_optimized(canvas, full_options);
        update = optimized.update;
        destroy = optimized.destroy;
    } else {
        //I hate safari I hate safari I hate Safari I hate Safari
        const fallback = topology_fallback(canvas, full_options);
        update = fallback.update;
        destroy = fallback.destroy;
    }


    return {
        update: (new_partial_options: TopologyOptions) => {
            const new_options = { ...DEFAULT_OPTIONS, ...new_partial_options };
            update(new_options);
        },
        destroy
    }
}

function supports_offscreen_and_worker() : boolean {
    if(!("Worker" in globalThis)) return false;
    if(!("OffscreenCanvas" in globalThis)) return false;
    if(!("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return false;

    try {
        //Safari 16.4 supports OffscreenCanvas but not the WebGl rendering context on it
        //Here we check if the webgl rendering context is supported on an OffscreenCanvas
        const offscreen_canvas = new OffscreenCanvas(1, 1);
        const gl = offscreen_canvas.getContext("webgl");
        return gl instanceof WebGLRenderingContext; //If this is false, then the webgl context is not supported
    } catch(e) {
        return false;
    }
}