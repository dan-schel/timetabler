import { TimetableChoices } from "../timetable/timetable-choices";
import { BlocksRenderer } from "./blocks-renderer";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";

/** Handles rendering the timetable to the canvas. */
export class TimetableRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** Draws the gridlines. */
  private readonly _gridlines: GridlinesRenderer;

  /** Draws the timetable blocks. */
  private readonly _blocks: BlocksRenderer;

  /**
   * Creates a {@link TimetableRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;

    this._gridlines = new GridlinesRenderer(canvas);
    this._blocks = new BlocksRenderer(canvas, this._gridlines);
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // Allow the gridlines to update the hour range and days of week being
    // shown.
    this._gridlines.onTimetableUpdate(timetable);

    // Rearrange blocks if needed.
    this._blocks.onTimetableUpdate(timetable);

    this._canvas.draw(true);
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    this._gridlines.draw(ctx);
    this._blocks.draw(ctx);
  }

  /**
   * Called when the mouse/touch is pressed on the canvas.
   * @param e The event details.
   */
  onPointerDown(e: MouseEvent) {
    this._blocks.onPointerDown(e);
  }

  /**
   * Called when the mouse/touch is released on the canvas.
   * @param e The event details.
   */
  onPointerUp(e: MouseEvent) {
    this._blocks.onPointerUp(e);
  }

  /**
   * Called when the mouse/touch moves on the canvas.
   * @param e The event details.
   */
  onPointerMove(e: MouseEvent) {
    this._blocks.onPointerMove(e);
  }
}
