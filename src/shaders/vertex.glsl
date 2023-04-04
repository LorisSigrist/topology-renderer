precision highp float;

attribute vec2 position;
varying vec2 fragCoord;

// Just a simple vertex shader that passes on the 2d position to the fragment shader
void main() {
    fragCoord = position;
    gl_Position = vec4(position, 0.0, 1.0);
}