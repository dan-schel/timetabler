import { ClassUIController } from "./class-ui-controller";
import { Html } from "./main";
import { TimetableChoices } from "./timetable/timetable-choices";

/** Manages the controls UI (the side-panel). */
export class ControlsController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /**
   * A copy of the currently displayed timetable purely for comparison to the
   * new data.
   */
  private _prevTimetable: TimetableChoices | null;

  /**
   * Creates a {@link ControlsController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._prevTimetable = null;
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // Avoid recreating the UI for each class if the timetable hasn't changed.
    if (this._prevTimetable == null ||
      !timetable.timetable.equals(this._prevTimetable.timetable)) {

      // Add the "non-empty" class to the controls (hides the startup message).
      this._html.controls.classList.toggle(
        "non-empty", timetable.timetable.classes.length != 0
      );

      this._html.classes.replaceChildren(...timetable.timetable.classes.map(c => {
        return ClassUIController.create(c).$div;
      }));
    }

    this._prevTimetable = timetable;
  }
}
