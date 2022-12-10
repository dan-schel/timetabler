import { TimetableChoices } from "../timetable/timetable-choices";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";

/** Handles rendering the timetable to the canvas. */
export class TimetableRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  private readonly _gridlines: GridlinesRenderer;

  /**
   * Creates a {@link TimetableRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;

    this._gridlines = new GridlinesRenderer(canvas);
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // todo: figure out how to render the changes.

    this._canvas.draw(true);
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    this._gridlines.draw(ctx);
  }
}
