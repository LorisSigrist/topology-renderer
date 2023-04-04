import { topology } from "./src/topology";
import "./style.css";

const canvas = document.getElementById("topology");
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("canvas is not HTMLCanvasElement");

const { destroy, update } = topology(canvas);
