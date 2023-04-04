/// <reference types="vite/client" />
import vertex_shader_source from "./shaders/vertex.glsl?raw";
import fragment_shader_source from "./shaders/fragment.glsl?raw";

/** @typedef {[number, number, number]} vec3 */

/** @type {vec3} */
const BACKGROUND_COLOR = [0, 22 / 255, 37 / 255];

/** @type {vec3} */
const LINE_COLOR = [41 / 255, 56 / 255, 76 / 255];

/**
 * @param {HTMLCanvasElement} canvas
 */
export const topology = (canvas) => {

    
  // Initialize WebGL
  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("gl is not WebGLRenderingContext");

  //Initialize and Bind Vertex Buffer for Quad
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0];
  const indecies = [3, 2, 1, 3, 1, 0];
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indecies),
    gl.STATIC_DRAW
  );

  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertex_shader) throw new Error("vertexShader is not WebGLShader");
  gl.shaderSource(vertex_shader, vertex_shader_source);
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
  gl.shaderSource(fragment_shader, fragment_shader_source);
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

  gl.useProgram(program);

  //The shaders are no longer needed. They will get deleted when the program is deleted
  gl.deleteShader(vertex_shader);
  gl.deleteShader(fragment_shader);


  //Get the location of the attributes and uniforms
  const position_attribute_location = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(position_attribute_location, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position_attribute_location);

  //Get uniform locations
  const u_background_color = gl.getUniformLocation(program, "background_color");
  gl.uniform3f(u_background_color, ...BACKGROUND_COLOR);

  const u_line_color = gl.getUniformLocation(program, "line_color");
  gl.uniform3f(u_line_color, ...LINE_COLOR);

  const u_aspect_ratio = gl.getUniformLocation(program, "aspect_ratio");
  const u_time = gl.getUniformLocation(program, "time");

  /** @type {number | null} */
  let frame = null;

  const render = () => {
    const canvas_element_width = document.body.clientWidth;
    const canvas_element_height = document.body.clientHeight;

    const canvas_render_width = canvas_element_width * window.devicePixelRatio;
    const canvas_render_height =
      canvas_element_height * window.devicePixelRatio;

    // Set canvas size
    canvas.width = canvas_render_width;
    canvas.height = canvas_render_height;

    canvas.style.width = canvas_element_width + "px";
    canvas.style.height = canvas_element_height + "px";

    const aspect_ratio = canvas_render_width / canvas_render_height;

    gl.uniform1f(u_aspect_ratio, aspect_ratio);
    gl.uniform1f(u_time, performance.now());

    gl.clearColor(...BACKGROUND_COLOR, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas_render_width, canvas_render_height);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    frame = requestAnimationFrame(render);
  };

  frame = requestAnimationFrame(render);

  return {
    update() {},
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(indexBuffer);
    },
  };
};
