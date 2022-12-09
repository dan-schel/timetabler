import { Html } from "./main";

/**
 * Handles the sizing/rendering of the canvas.
 */
export class CanvasController {
  /** References to the HTML elements on the page. */
  readonly html: Html;

  /** The current width of the canvas. */
  width: number;

  /** The current height of the canvas. */
  height: number;

  /** The current DPI ratio of the canvas. */
  dpiRatio: number;

  /** A reference to the canvas 2D context. */
  private _ctx: CanvasRenderingContext2D;

  /** A reference to frequently used CSS values. */
  private _css: {
    colorInk80: string
  };

  /**
   * Creates a {@link CanvasController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this.html = html;
    this.width = 0;
    this.height = 0;
    this.dpiRatio = 1;

    // Retrieve the canvas context from the HTML element.
    this._ctx = (() => {
      const maybe = html.canvas.getContext("2d");
      if (maybe == null) { throw new Error("Cannot get canvas context"); }
      return maybe;
    })();

    // Calculate the frequently use CSS values.
    this._css = (() => {
      const style = getComputedStyle(html.canvas);
      return {
        colorInk80: style.getPropertyValue("--color-ink-80")
      };
    })();
  }

  /**
   * Fit the canvas to it's container. Must be called on page load and everytime
   * the page resizes.
   */
  fitCanvas() {
    // Get the width/height available.
    const containerSize = this.html.canvasContainer.getBoundingClientRect();
    this.width = containerSize.width;
    this.height = containerSize.height;

    // Get the canvas context. Throw if null (shouldn't be on any SLIGHTLY modern
    // browser).
    const ctx = this.html.canvas.getContext("2d");
    if (ctx == null) { throw new Error("Cannot get canvas context"); }
    this.dpiRatio = calculateDpiRatio(ctx);

    this.html.canvas.style.width = `${this.width}px`;
    this.html.canvas.style.height = `${this.height}px`;
    this.html.canvas.width = this.width * this.dpiRatio;
    this.html.canvas.height = this.height * this.dpiRatio;

    // Now the size has changed, redraw everything.
    this.draw();
  }

  /**
   * (Re)draw the content on the canvas.
   */
  draw() {
    // Scale the context based on the DPI ratio to ensure consistent sizing for
    // high-DPI displays. Apply as a matrix so we don't need to do it for every
    // measurement individually.
    this._ctx.save();
    this._ctx.scale(this.dpiRatio, this.dpiRatio);

    // Do all drawing!
    this._ctx.font = "1rem Atkinson Hyperlegible";
    this._ctx.fillStyle = this._css.colorInk80;
    this._ctx.fillText(
      "Hello",
      this.width - 52,
      this.height - 16
    );

    // Restore the canvas to the default transform once drawing is complete. This
    // doesn't seem necessary.
    this._ctx.restore();
  }
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
