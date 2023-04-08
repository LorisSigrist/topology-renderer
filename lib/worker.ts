//reference web-worker types
/// <reference lib="webworker" />
import { type TopologyRenderingOptions, topology } from "./topology";

let update: ((options: TopologyRenderingOptions) => void) | null = null;
let destroy: (() => void) | null = null;

type ValidMessage = {
    type: "init";
    canvas: OffscreenCanvas;
    options: TopologyRenderingOptions;
} | {
    type: "update";
    options: TopologyRenderingOptions;
} | {
    type: "destroy";
};

function handle_message(e: MessageEvent<ValidMessage>) {
    const type = e.data.type;
    switch (type) {
        case "init": {
            const { canvas, options } = e.data;
            init(canvas, options);
            break;
        }
        case "update": {
            const { options } = e.data;
            update_options(options);
            break;
        }
        case "destroy": {
            destroy_topology();
            break;
        }
        default: {
            throw new Error("Invalid message type");
        }
    }
}

function init(canvas: OffscreenCanvas, options: TopologyRenderingOptions) {
    const { update: u, destroy: d } = topology(canvas, options);
    update = u;
    destroy = d;
}

function update_options(options: TopologyRenderingOptions) {
    if (!update) throw new Error("Topology not initialized");
    update(options);
}

function destroy_topology() {
    if (!destroy) throw new Error("Topology not initialized");
    destroy();
    update = null;
    destroy = null;
}

addEventListener("message", handle_message);
