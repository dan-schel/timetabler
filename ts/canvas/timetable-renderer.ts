import { TimetableChoices } from "../timetable/timetable-choices";
import { CanvasController } from "./canvas-controller";
import { cubicOut, Transition } from "./transition";

/** Handles rendering the timetable to the canvas. */
export class TimetableRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  // <TEMPORARY>
  classesNum: number;
  transition: Transition;
  // </TEMPORARY>

  /**
   * Creates a {@link TimetableRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;

    // <TEMPORARY>
    this.classesNum = 0;
    this.transition = new Transition(canvas, this.classesNum, 0.5, cubicOut);
    // </TEMPORARY>
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // <TEMPORARY>
    this.classesNum = timetable.choices.length == 0 ? 0 :
      timetable.choices[0].option?.blocks[0].dayOfWeek.daysSinceMonday ?? 0;
    this.transition.animateTo(this.classesNum);
    // </TEMPORARY>

    this._canvas.draw(true);
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx
   */
  draw(ctx: CanvasRenderingContext2D) {
    // <TEMPORARY>
    ctx.font = "1rem Atkinson Hyperlegible";
    ctx.fillStyle = this._canvas.css.colorInk80;
    ctx.fillText(
      `${this.classesNum} days since Monday`,
      10,
      20 + this.transition.value() * 40
    );
    // </TEMPORARY>
  }
}
