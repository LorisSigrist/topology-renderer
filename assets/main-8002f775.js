(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function c(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(o){if(o.ep)return;o.ep=!0;const r=c(o);fetch(o.href,r)}})();const B=`precision highp float;

attribute vec2 position;
varying vec2 fragCoord;

// Just a simple vertex shader that passes on the 2d position to the fragment shader
void main() {
    fragCoord = position;
    gl_Position = vec4(position, 0.0, 1.0);
}`,k=`precision highp float;

uniform vec3 background_color;
uniform vec3 line_color;

uniform float aspect_ratio;
uniform float time;

varying vec2 fragCoord;


vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

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

`,g={background_color:[0,22,37],line_color:[41,56,76],speed:1},O=(e,t=g)=>{let c={...g,...t};const n=U(e),{vertex_buffer:o,index_buffer:r}=M(n),{program:i,vertex_shader:L,fragment_shader:T}=D(n);n.useProgram(i),n.deleteShader(L),n.deleteShader(T);const x=n.getAttribLocation(i,"position");n.vertexAttribPointer(x,2,n.FLOAT,!1,0,0),n.enableVertexAttribArray(x);const A=n.getUniformLocation(i,"background_color"),I=n.getUniformLocation(i,"line_color"),z=n.getUniformLocation(i,"aspect_ratio"),R=n.getUniformLocation(i,"time");let s=null;const v=()=>{const d=b(c.background_color),F=b(c.line_color),_=document.body.clientWidth,y=document.body.clientHeight,l=_*window.devicePixelRatio,u=y*window.devicePixelRatio;e.width=l,e.height=u,e.style.width=_+"px",e.style.height=y+"px";const P=l/u;n.uniform3f(A,...d),n.uniform3f(I,...F),n.uniform1f(z,P),n.uniform1f(R,performance.now()/1e3*c.speed),n.clearColor(...d,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.viewport(0,0,l,u),n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0),s=requestAnimationFrame(v)};return s=requestAnimationFrame(v),{update(d){c={...c,...d}},destroy(){s&&cancelAnimationFrame(s),n.deleteProgram(i),n.deleteBuffer(o),n.deleteBuffer(r)}}};function U(e){const t=e.getContext("webgl");if(!t)throw new Error("gl is not WebGLRenderingContext");return t}function M(e){const t=e.createBuffer(),c=e.createBuffer(),n=[-1,1,-1,-1,1,-1,1,1],o=[3,2,1,3,1,0];return e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array(n),e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,c),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(o),e.STATIC_DRAW),{vertex_buffer:t,index_buffer:c}}function D(e,t,c){const n=e.createShader(e.VERTEX_SHADER);if(!n)throw new Error("vertexShader is not WebGLShader");if(e.shaderSource(n,B),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw console.error("Could not compile vertex shader",e.getShaderInfoLog(n)),e.deleteShader(n),new Error("Could not compile vertex shader - Check console for details");const o=e.createShader(e.FRAGMENT_SHADER);if(!o)throw new Error("fragmentShader is not WebGLShader");if(e.shaderSource(o,k),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw console.error("Could not compile fragment shader",e.getShaderInfoLog(o)),e.deleteShader(o),new Error("Could not compile fragment shader - Check console for details");const r=e.createProgram();if(!r)throw new Error("program is not WebGLProgram");if(e.attachShader(r,n),e.attachShader(r,o),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw console.error("Could not link program"),e.deleteProgram(r),new Error("Could not link program - Check console for details");return{program:r,vertex_shader:n,fragment_shader:o}}function b(e){return e.map(t=>t/255)}const w=document.getElementById("topology");if(!(w instanceof HTMLCanvasElement))throw new Error("canvas is not HTMLCanvasElement");const m=document.getElementById("background_color");if(!(m instanceof HTMLInputElement))throw new Error("background_color is not HTMLInputElement");const h=document.getElementById("line_color");if(!(h instanceof HTMLInputElement))throw new Error("line_color is not HTMLInputElement");let a={speed:1,background_color:[0,0,0],line_color:[255,255,255]};const{destroy:N,update:p}=O(w,a),E=()=>{const e=S(m.value);a={...a,background_color:e},p(a)},C=()=>{const e=S(h.value);a={...a,line_color:e},p(a)};E();C();const f=document.getElementById("speed");if(!(f instanceof HTMLInputElement))throw new Error("speed is not HTMLInputElement");f.addEventListener("input",()=>{a={...a,speed:Number(f.value)},p(a)});m.addEventListener("input",E);h.addEventListener("input",C);function S(e){return[parseInt(e.substring(1,3),16),parseInt(e.substring(3,5),16),parseInt(e.substring(5,7),16)]}
