import { topology } from "./lib/index";
import "./style.css";

const canvas = document.getElementById("topology");
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("canvas is not HTMLCanvasElement");

const background_color = document.getElementById("background_color");
if (!(background_color instanceof HTMLInputElement))
  throw new Error("background_color is not HTMLInputElement");

const line_color = document.getElementById("line_color");
if (!(line_color instanceof HTMLInputElement))
  throw new Error("line_color is not HTMLInputElement");

const stop_button = document.getElementById("stop");
if (!(stop_button instanceof HTMLButtonElement))
  throw new Error("stop_button is not HTMLButtonElement");



/** @type {import("./lib/index").TopologyOptions} */
let options = {
  speed: 1,
  background_color: [0, 0, 0],
  line_color: [255, 255, 255],
  width: document.body.clientWidth,
  height: document.body.clientHeight,
};

const { destroy, update } = topology(canvas, options);

const update_background_color = () => {
  const rgb = hex2rgb(background_color.value);
  options = { ...options, background_color: rgb };
  update(options);
};

const update_line_color = () => {
  const rgb = hex2rgb(line_color.value);
  options = { ...options, line_color: rgb };
  update(options);
};

update_background_color();
update_line_color();


const speed = document.getElementById("speed");
if (!(speed instanceof HTMLInputElement))
  throw new Error("speed is not HTMLInputElement");

speed.addEventListener("input", () => {
  options = { ...options, speed: Number(speed.value) };
  update(options);
});

background_color.addEventListener("input", update_background_color);
line_color.addEventListener("input", update_line_color);

window.addEventListener("resize", () => {
  options = { ...options, width: document.body.clientWidth, height: document.body.clientHeight };
  update(options);
});

stop_button.addEventListener("click", () => {
  destroy();
  stop_button.disabled = true;
});

/**
 * Returns the RGB values of a hex color
 * @param {string} hex
 * @returns {[number, number, number]}
 */
function hex2rgb(hex) {
  return [
    parseInt(hex.substring(1, 3), 16),
    parseInt(hex.substring(3, 5), 16),
    parseInt(hex.substring(5, 7), 16),
  ];
}


