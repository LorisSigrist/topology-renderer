/// <reference types="vite/client" />
/// <reference types="vite-plugin-glsl/ext" />
import vertex_shader_source from "./shaders/vertex.glsl";
import fragment_shader_source from "./shaders/fragment.glsl";

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
  let options = { ...DEFAULT_OPTIONS, ...partial_options };

  // Initialize WebGL
  const gl = get_context(canvas);

  const { vertex_buffer, index_buffer } = set_up_rect(gl);
  const { program, vertex_shader, fragment_shader } = create_program(
    gl,
    vertex_shader_source,
    fragment_shader_source
  );

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

  /**
   * Keeps track of the current animation frame so it can be cancelled if needed
   * @type {number | null}
   */
  let frame = null;

  const render = () => {
    //Set colors
    const background_color = to_glsl_color(options.background_color);
    const line_color = to_glsl_color(options.line_color);

    // Resize canvas to match the size it's displayed
    const canvas_element_width = options.width;
    const canvas_element_height = options.height;

    const canvas_render_width = canvas_element_width * window.devicePixelRatio;
    const canvas_render_height =
      canvas_element_height * window.devicePixelRatio;

    canvas.width = canvas_render_width;
    canvas.height = canvas_render_height;

    canvas.style.width = canvas_element_width + "px";
    canvas.style.height = canvas_element_height + "px";

    const aspect_ratio = canvas_render_width / canvas_render_height;

    gl.uniform3f(u_background_color, ...background_color);
    gl.uniform3f(u_line_color, ...line_color);

    gl.uniform1f(u_aspect_ratio, aspect_ratio);
    gl.uniform1f(u_time, (performance.now() / 1000) * options.speed);

    gl.clearColor(...background_color, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas_render_width, canvas_render_height);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    frame = requestAnimationFrame(render);
  };

  frame = requestAnimationFrame(render);

  return {
    /** @param {TopologyOptions} new_options */
    update(new_options) {
      options = { ...DEFAULT_OPTIONS, ...new_options };
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteBuffer(vertex_buffer);
      gl.deleteBuffer(index_buffer);
    },
  };
};


function get_context(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("gl is not WebGLRenderingContext");
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

function to_glsl_color(color: [number, number, number]) : [number, number, number] {
  // @ts-ignore
  return color.map((c) => c / 255);
}