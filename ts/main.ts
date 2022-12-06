import { finder } from "schel-d-utils-browser";

// Retrieve the HTML elements from the page.
const html = {
  controls: finder.any("controls"),
  canvasContainer: finder.div("canvas-container"),
  canvas: finder.canvas("canvas"),
  mobileExpanderButton: finder.button("mobile-expander-button")
};

// Retrieve colors in CSS custom properties.
const css = (() => {
  const style = getComputedStyle(html.canvas);
  return {
    colorInk80: style.getPropertyValue("--color-ink-80")
  };
})();

// Get the canvas context (throw an error if it's null).
const ctx = (() => {
  const maybe = html.canvas.getContext("2d");
  if (maybe == null) { throw new Error("Cannot get canvas context"); }
  return maybe;
})();

let width = 0;
let height = 0;
let dpiRatio = 1;

// Set the canvas size and draw. Also have the canvas resize itself when the
// window size changes.
fitCanvas();
window.addEventListener("resize", () => fitCanvas());

// Toggle the "collapsed" class on the controls when the expander button is
// clicked (only appears when the screen is too small to keep it permanently
// open).
html.mobileExpanderButton.addEventListener("click", () => {
  html.controls.classList.toggle("collapsed");
});

/**
 * Fit the canvas to it's container. Must be called on page load and everytime
 * the page resizes.
 */
function fitCanvas() {
  // Get the width/height available.
  const containerSize = html.canvasContainer.getBoundingClientRect();
  width = containerSize.width;
  height = containerSize.height;

  // Get the canvas context. Throw if null (shouldn't be on any SLIGHTLY modern
  // browser).
  const ctx = html.canvas.getContext("2d");
  if (ctx == null) { throw new Error("Cannot get canvas context"); }
  dpiRatio = calculateDpiRatio(ctx);

  html.canvas.style.width = `${width}px`;
  html.canvas.style.height = `${height}px`;
  html.canvas.width = width * dpiRatio;
  html.canvas.height = height * dpiRatio;

  // Now the size has changed, redraw everything.
  draw();
}

/**
 * (Re)draw the content on the canvas.
 */
function draw() {
  // Scale the context based on the DPI ratio to ensure consistent sizing for
  // high-DPI displays. Apply as a matrix so we don't need to do it for every
  // measurement individually.
  ctx.save();
  ctx.scale(dpiRatio, dpiRatio);

  // Do all drawing!
  ctx.font = "1rem Atkinson Hyperlegible";
  ctx.fillStyle = css.colorInk80;
  ctx.fillText(
    "Word",
    width - 30,
    height - 30
  );

  // Restore the canvas to the default transform once drawing is complete. This
  // doesn't seem necessary.
  ctx.restore();
}

/**
 * Uses `devicePixelRatio` and `backingStorePixelRatio` to calculate how to
 * scale the canvas appropriately for high DPI displays.
 */
function calculateDpiRatio(ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio ?? 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bsr = (ctx as any).backingStorePixelRatio ?? 1;
  return dpr / bsr;
};
