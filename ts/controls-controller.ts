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

  private _classUIs: ClassUIController[];

  /**
   * Creates a {@link ControlsController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._prevTimetable = null;
    this._classUIs = [];
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // Avoid recreating the UI for each class if the timetable hasn't changed.
    if (this._prevTimetable == null ||
      !timetable.timetable.equals(this._prevTimetable.timetable)) {

      // Add the "non-empty" class to the controls (hides the startup message).
      this._html.controls.classList.toggle(
        "non-empty", timetable.timetable.classes.length != 0
      );

      this._classUIs = timetable.timetable.classes.map(cl => {
        const choice = timetable.choices.find(ch => ch.timetableClass.equals(cl));

        // Should never happen. TimetableChoice ensures there's a choice for
        // each class.
        if (choice == null) { throw new Error(); }

        const ui = ClassUIController.create(cl);
        ui.select(choice.option);

        return ui;
      });

      this._html.classes.replaceChildren(...this._classUIs.map(u => u.$div));
    }

    // Update the selected options regardless.
    timetable.choices.forEach(ch => {
      const classUI = this._classUIs.find(
        u => u.timetableClass.equals(ch.timetableClass)
      );

      // Should never happen. A class UI is made for each class in the timetable
      // and a choice cannot have a class that isn't in the timetable.
      if (classUI == null) { throw new Error(); }

      classUI.select(ch.option);
    });

    // Update the statuses (the expanded one and the collapsed one).
    const selector = `.${this._html.statusContainerClass}`;
    document.querySelectorAll(selector).forEach(e => {
      const hasClashes = timetable.clashingBlocks().length > 0;
      const hasUnallocated = timetable.unallocatedMandatoryClasses().length > 0;

      // Only add the .unallocated class if there are no clashes (they take
      // priority).
      e.classList.toggle("clash", hasClashes);
      e.classList.toggle("unallocated", hasUnallocated && !hasClashes);
    });

    this._prevTimetable = timetable;
  }
}
