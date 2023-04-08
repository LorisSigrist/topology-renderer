/// <reference types="vite-plugin-glsl/ext" />
import vertex_shader_source from "./shaders/vertex.glsl";
import fragment_shader_source from "./shaders/fragment.glsl";

// This does the actual rendering of the topology pattern.
// It expects to be run in a worker thread, but works fine in the main thread as well.
// This does not do the device-pixel-ratio scaling, so it's up to the caller to do that.

export interface TopologyRenderingOptions {
    render_width: number;
    render_height: number;
    background_color: [number, number, number];
    line_color: [number, number, number];
    speed: number;
}

export function topology(canvas: OffscreenCanvas, options: TopologyRenderingOptions) {

    function set_size(width: number, height: number) {
        canvas.width = width;
        canvas.height = height;
    }

    set_size(options.render_width, options.render_height);

    const gl = get_context(canvas);

    const { vertex_buffer, index_buffer } = set_up_rect(gl);
    const { program, vertex_shader, fragment_shader } = create_program(gl, vertex_shader_source, fragment_shader_source);


    gl.useProgram(program);

    //The shaders are no longer needed. They will get deleted when the program using them is freed
    gl.deleteShader(vertex_shader);
    gl.deleteShader(fragment_shader);

    //Get the location of the attributes and uniforms
    const position_attribute_location = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position_attribute_location, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position_attribute_location);

    //Get uniform locations
    const u_background_color = gl.getUniformLocation(program, "background_color");
    const u_line_color = gl.getUniformLocation(program, "line_color");
    const u_aspect_ratio = gl.getUniformLocation(program, "aspect_ratio");
    const u_time = gl.getUniformLocation(program, "time");

    //Set viewport
    set_viewport(gl, options.render_width, options.render_height);

    let frame: number | null = null;

    let background_color = to_glsl_color(options.background_color);
    let line_color = to_glsl_color(options.line_color);

    const render = () => {

        const aspect_ratio = options.render_width / options.render_height;

        gl.uniform3f(u_background_color, ...background_color);
        gl.uniform3f(u_line_color, ...line_color);
    
        gl.uniform1f(u_aspect_ratio, aspect_ratio);
        gl.uniform1f(u_time, (performance.now() / 1000) * options.speed);
    
        gl.clearColor(...background_color, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);

    return {
        update: (new_rendering_options : TopologyRenderingOptions) => {
            options = new_rendering_options;
            background_color = to_glsl_color(options.background_color);
            line_color = to_glsl_color(options.line_color);
            set_size(options.render_width, options.render_height);
            set_viewport(gl, options.render_width, options.render_height);
        },
        destroy: () => {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }

            //Delete the program
            gl.deleteProgram(program);
            gl.deleteBuffer(vertex_buffer);
            gl.deleteBuffer(index_buffer);
        }
    }
}


function get_context(canvas: OffscreenCanvas): WebGLRenderingContext {
    const gl = canvas.getContext("webgl");
    if(!(gl instanceof WebGLRenderingContext)) throw new Error("gl is not WebGLRenderingContext");
    return gl;
}

function set_up_rect(gl: WebGLRenderingContext) {
    //Initialize and Bind Vertex Buffer for Quad
    const vertex_buffer = gl.createBuffer();
    const index_buffer = gl.createBuffer();
    const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0];
    const indecies = [3, 2, 1, 3, 1, 0];

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indecies),
        gl.STATIC_DRAW
    );

    return { vertex_buffer, index_buffer };
}

function create_program(gl: WebGLRenderingContext, vertex_shader_code: string, fragment_shader_code: string) {
    const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertex_shader) throw new Error("vertexShader is not WebGLShader");
    gl.shaderSource(vertex_shader, vertex_shader_code);
    gl.compileShader(vertex_shader);
    if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
        console.error(
            "Could not compile vertex shader",
            gl.getShaderInfoLog(vertex_shader)
        );
        gl.deleteShader(vertex_shader);
        throw new Error(
            "Could not compile vertex shader - Check console for details"
        );
    }

    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragment_shader) throw new Error("fragmentShader is not WebGLShader");
    gl.shaderSource(fragment_shader, fragment_shader_code);
    gl.compileShader(fragment_shader);
    if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
        console.error(
            "Could not compile fragment shader",
            gl.getShaderInfoLog(fragment_shader)
        );
        gl.deleteShader(fragment_shader);
        throw new Error(
            "Could not compile fragment shader - Check console for details"
        );
    }

    const program = gl.createProgram();
    if (!program) throw new Error("program is not WebGLProgram");
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Could not link program");
        gl.deleteProgram(program);
        throw new Error("Could not link program - Check console for details");
    }

    return { program, vertex_shader, fragment_shader };
}

function to_glsl_color(color: [number, number, number]): [number, number, number] {
    // @ts-ignore
    return color.map((c) => c / 255);
}

function set_viewport(gl: WebGLRenderingContext, render_width: number, render_height: number) {
    gl.viewport(0, 0, render_width, render_height);
}