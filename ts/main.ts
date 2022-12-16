import { finder } from "schel-d-utils-browser";
import { CanvasController } from "./canvas/canvas-controller";
import { ControlsController } from "./controls-controller";
import { DropdownCoordinator } from "./dropdown-coordinator";
import { Timetable } from "./timetable/timetable";
import { TimetableChoices } from "./timetable/timetable-choices";

// Retrieve the HTML elements from the page.
const html = {
  controls: finder.any("controls"),
  canvasContainer: finder.any("canvas-container"),
  canvas: finder.canvas("canvas"),
  mobileExpanderButton: finder.button("mobile-expander-button"),
  importButton: finder.button("import-button"),
  exportButton: finder.button("export-button"),
  addClassButton: finder.button("add-class-button"),
  classes: finder.div("classes"),
  statusContainerClass: "status-container",
  editClassMenu: finder.div("edit-class-menu"),
  editClassErrorText: finder.any("edit-class-error-text"),
  editClassBackButton: finder.button("edit-class-back-button"),
  editClassNameInput: finder.input("edit-class-name-input"),
  editClassTypeInput: finder.input("edit-class-type-input"),
  editClassColorPicker: finder.div("edit-class-color-picker"),
  editClassOptionalSwitch: finder.input("edit-class-optional-switch"),
  editClassSubmitButton: finder.button("edit-class-submit-button"),
};

// Used by other files to refer to the above html object.
export type Html = typeof html;

const controls = new ControlsController(html);

// Initially, start with an empty timetable.
let timetable = new TimetableChoices(new Timetable([]), []);

// Set the canvas size and draw. Also have the canvas resize itself when the
// window size changes.
const canvas = new CanvasController(html);
canvas.fitCanvas();
window.addEventListener("resize", () => canvas.fitCanvas());

// Redraw the canvas when the webfonts have loaded.
document.fonts.ready.then(() => canvas.markDirty());

export const dropdowns = new DropdownCoordinator();

/**
 * Modifies the timetable/choices being displayed with a new one.
 * @param newTimetable The new timetable.
 */
export function updateTimetable(newTimetable: TimetableChoices) {
  timetable = newTimetable;
  controls.onTimetableUpdate(timetable);
  canvas.onTimetableUpdate(timetable);
}

/** Returns the current choices/timetable. */
export function getCurrentTimetable(): TimetableChoices {
  return timetable;
}
