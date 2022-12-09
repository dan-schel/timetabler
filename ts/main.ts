import { finder } from "schel-d-utils-browser";
import { CanvasController } from "./canvas-controller";

// Retrieve the HTML elements from the page.
const html = {
  controls: finder.any("controls"),
  canvasContainer: finder.div("canvas-container"),
  canvas: finder.canvas("canvas"),
  mobileExpanderButton: finder.button("mobile-expander-button")
};

// Used by other files to refer to the above html object.
export type Html = typeof html;

// Set the canvas size and draw. Also have the canvas resize itself when the
// window size changes.
const canvas = new CanvasController(html);
canvas.fitCanvas();
window.addEventListener("resize", () => canvas.fitCanvas());

// Toggle the "collapsed" class on the controls when the expander button is
// clicked (only appears when the screen is too small to keep it permanently
// open).
html.mobileExpanderButton.addEventListener("click", () => {
  html.controls.classList.toggle("collapsed");
});
