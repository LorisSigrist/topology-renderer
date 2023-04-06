precision highp float;

uniform vec3 background_color;
uniform vec3 line_color;

uniform float aspect_ratio;
uniform float time;

varying vec2 fragCoord;

// Includes are provided by vite-plugin-glsl
#include utils/noise; 


const float height_span = 255.0;
const float line_spacing = 32.0;
const float line_width = 2.0;

void main(){
    vec2 uv = vec2(fragCoord.x * aspect_ratio, fragCoord.y);

    float height = snoise(vec3(uv, time / 100.0 ));

    //Check if the height is in one of the bands
    float mod_height = mod(height * height_span, line_spacing);

    if(mod_height < line_width){
        //If it is, set the color to the line color
        gl_FragColor = vec4(line_color, 1.0);
        return;
    } 

    //Otherwise, set the color to the background color
    gl_FragColor = vec4(background_color, 1.0);
}

