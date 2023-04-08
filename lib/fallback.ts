//Safari is a garbage browser, hence the fallback.
import { FullTopologyOptions } from ".";
import { TopologyRenderingOptions } from "./topology";
import { topology as renderer } from "./topology";

export function topology(canvas: HTMLCanvasElement, options: FullTopologyOptions) {
    set_element_size(canvas, options.width, options.height);
    const rendering_options = get_rendering_options(options);

    const { update: update_renderer, destroy: destroy_renderer } = renderer(canvas, rendering_options);

    return {
        update: (new_options: FullTopologyOptions) => {
            set_element_size(canvas, new_options.width, new_options.height);
            const rendering_options = get_rendering_options(new_options);
            update_renderer(rendering_options);
        },
        destroy: () => {
            destroy_renderer();
        }
    }
}

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