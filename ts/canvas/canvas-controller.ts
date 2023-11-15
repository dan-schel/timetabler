import { Html } from "../main";
import { TimetableChoices } from "../timetable/timetable-choices";
import { Animation } from "./animation";
import { TimetableRenderer } from "./timetable-renderer";

/**
 * Handles the sizing/rendering of the canvas, and running animations on the
 * canvas.
 */
export class CanvasController {
  /** The current width of the canvas. */
  width: number;

  /** The current height of the canvas. */
  height: number;

  /** The current DPI ratio of the canvas. */
  dpiRatio: number;

  /** A reference to frequently used CSS values. */
  css: {
    colorInk10: string;
    colorInk30: string;
    colorInk80: string;
    colorOnAccent: string;
    colorPaper20: string;
    classColors: {
      red: { gradient1: string; gradient2: string; on: string };
      orange: { gradient1: string; gradient2: string; on: string };
      yellow: { gradient1: string; gradient2: string; on: string };
      green: { gradient1: string; gradient2: string; on: string };
      cyan: { gradient1: string; gradient2: string; on: string };
      blue: { gradient1: string; gradient2: string; on: string };
      purple: { gradient1: string; gradient2: string; on: string };
      pink: { gradient1: string; gradient2: string; on: string };
    };
  };

  /** Controls what is rendered to the canvas. */
  private _renderer: TimetableRenderer;

  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /** A reference to the canvas 2D context. */
  private _ctx: CanvasRenderingContext2D;

  /**
   * The value of Date.now in the last frame. Set to null initially.
   */
  private _lastFrameTime: number | null;

  /** The running animations. */
  private _animations: Animation[];

  /** True if requestAnimationFrame has already been called. */
  private _dirty: boolean;

  /**
   * Creates a {@link CanvasController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this.width = 0;
    this.height = 0;
    this.dpiRatio = 1;

    // Retrieve the canvas context from the HTML element.
    this._ctx = (() => {
      const maybe = html.canvas.getContext("2d");
      if (maybe == null) {
        throw new Error("Cannot get canvas context");
      }
      return maybe;
    })();

    // Calculate the frequently use CSS values.
    this.css = getCSS(html);

    this._lastFrameTime = null;
    this._animations = [];

    this._renderer = new TimetableRenderer(this);

    this._html.canvas.addEventListener("pointerdown", (e) =>
      this._renderer.onPointerDown(e)
    );
    this._html.canvas.addEventListener("pointerup", (e) =>
      this._renderer.onPointerUp(e)
    );
    this._html.canvas.addEventListener("pointerleave", (e) =>
      this._renderer.onPointerUp(e)
    );
    this._html.canvas.addEventListener("pointermove", (e) =>
      this._renderer.onPointerMove(e)
    );

    this._dirty = true;
    this._startDrawLoop();
  }

  /**
   * Draw/redraw the content on the canvas if required. Only call this once upon
   * creation.
   */
  private _startDrawLoop() {
    // Make sure we draw again next frame (if needed).
    requestAnimationFrame(() => this._startDrawLoop());

    // Calculate how last since the last frame (used to animations) and store
    // the current time for next time.
    const now = Date.now();
    const delta = (now - (this._lastFrameTime ?? now)) / 1000;
    this._lastFrameTime = now;

    // If there's nothing new to draw (and no animations running) then skip
    // drawing.
    if (!this._dirty && this._animations.length < 1) {
      return;
    }

    // Otherwise, clear the dirty flag and draw.
    this._dirty = false;
    this._draw(delta);
  }

  private _draw(delta: number) {
    // Scale the context based on the DPI ratio to ensure consistent sizing for
    // high-DPI displays. Apply as a matrix so we don't need to do it for every
    // measurement individually.
    this._ctx.save();
    this._ctx.clearRect(
      0,
      0,
      this.width * this.dpiRatio,
      this.height * this.dpiRatio
    );
    this._ctx.scale(this.dpiRatio, this.dpiRatio);

    // If there are animations to process, do those.
    if (this._animations.length > 0) {
      const animationsToDelete: Animation[] = [];

      // Run each animation. Add them to a list of animations to delete if done.
      this._animations.forEach((a) => {
        a.run(delta);
        if (a.isDone()) {
          animationsToDelete.push(a);
        }
      });

      // Remove all completed animations from the list.
      animationsToDelete.forEach((a) => {
        this._animations.splice(this._animations.indexOf(a), 1);
      });
    }

    // Do all drawing!
    this._renderer.draw(this._ctx);

    // Restore the canvas to the default transform once drawing is complete. This
    // doesn't seem necessary.
    this._ctx.restore();
  }

  /** Called when something wants a draw to occur on the next frame. */
  markDirty() {
    this._dirty = true;
  }

  /**
   * Fit the canvas to it's container. Must be called on page load and everytime
   * the page resizes.
   */
  fitCanvas() {
    // Get the width/height available.
    const containerSize = this._html.canvasContainer.getBoundingClientRect();
    this.width = containerSize.width;
    this.height = containerSize.height;

    // Get the canvas context. Throw if null (shouldn't be on any SLIGHTLY modern
    // browser).
    const ctx = this._html.canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("Cannot get canvas context");
    }
    this.dpiRatio = calculateDpiRatio(ctx);

    this._html.canvas.style.width = `${this.width}px`;
    this._html.canvas.style.height = `${this.height}px`;
    this._html.canvas.width = this.width * this.dpiRatio;
    this._html.canvas.height = this.height * this.dpiRatio;

    // Now the size has changed, redraw everything.
    this.markDirty();
  }

  /**
   * Makes the canvas aware of an animation, so it can begin animating it.
   * @param animation The animation to start.
   */
  startAnimation(animation: Animation) {
    this._animations.push(animation);
  }

  /**
   * Premuturely cancels an animation. Most common use case is where for
   * animations that are replaced by another because the value to animate to
   * changes mid-animation.
   * @param animation The animation to cancel.
   */
  cancelAnimation(animation: Animation) {
    const index = this._animations.indexOf(animation);
    if (index == -1) {
      throw new Error("Couldn't find that animation to cancel.");
    }
    this._animations.splice(index, 1);
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    this._renderer.onTimetableUpdate(timetable);
  }

  /**
   * Called when an event occurs that requires the CSS colors to be re-loaded,
   * such as a change to "prefers-color-scheme".
   */
  refreshCSS() {
    this.css = getCSS(this._html);
    this.markDirty();
  }
}

/**
 * Calculates the colors from the CSS.
 * @param html References to the HTML elements on the page.
 */
function getCSS(html: Html) {
  const style = getComputedStyle(html.canvas);
  return {
    colorInk10: style.getPropertyValue("--color-ink-10"),
    colorInk30: style.getPropertyValue("--color-ink-30"),
    colorInk80: style.getPropertyValue("--color-ink-80"),
    colorOnAccent: style.getPropertyValue("--color-on-accent"),
    colorPaper20: style.getPropertyValue("--color-paper-20"),
    classColors: {
      red: {
        gradient1: style.getPropertyValue("--color-red-gradient-1"),
        gradient2: style.getPropertyValue("--color-red-gradient-2"),
        on: style.getPropertyValue("--color-on-red"),
      },
      orange: {
        gradient1: style.getPropertyValue("--color-orange-gradient-1"),
        gradient2: style.getPropertyValue("--color-orange-gradient-2"),
        on: style.getPropertyValue("--color-on-orange"),
      },
      yellow: {
        gradient1: style.getPropertyValue("--color-yellow-gradient-1"),
        gradient2: style.getPropertyValue("--color-yellow-gradient-2"),
        on: style.getPropertyValue("--color-on-yellow"),
      },
      green: {
        gradient1: style.getPropertyValue("--color-green-gradient-1"),
        gradient2: style.getPropertyValue("--color-green-gradient-2"),
        on: style.getPropertyValue("--color-on-green"),
      },
      cyan: {
        gradient1: style.getPropertyValue("--color-cyan-gradient-1"),
        gradient2: style.getPropertyValue("--color-cyan-gradient-2"),
        on: style.getPropertyValue("--color-on-cyan"),
      },
      blue: {
        gradient1: style.getPropertyValue("--color-blue-gradient-1"),
        gradient2: style.getPropertyValue("--color-blue-gradient-2"),
        on: style.getPropertyValue("--color-on-blue"),
      },
      purple: {
        gradient1: style.getPropertyValue("--color-purple-gradient-1"),
        gradient2: style.getPropertyValue("--color-purple-gradient-2"),
        on: style.getPropertyValue("--color-on-purple"),
      },
      pink: {
        gradient1: style.getPropertyValue("--color-pink-gradient-1"),
        gradient2: style.getPropertyValue("--color-pink-gradient-2"),
        on: style.getPropertyValue("--color-on-pink"),
      },
    },
  };
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
}
