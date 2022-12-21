import { find } from "schel-d-utils-browser";
import { CanvasController } from "./canvas/canvas-controller";
import { ControlsController } from "./controls-controller";
import { DropdownCoordinator } from "./dropdown-coordinator";
import { Timetable } from "./timetable/timetable";
import { TimetableChoices } from "./timetable/timetable-choices";

// Retrieve the HTML elements from the page.
const html = {
  controls: find.any("controls"),
  canvasContainer: find.any("canvas-container"),
  canvas: find.canvas("canvas"),
  mobileExpanderButton: find.button("mobile-expander-button"),
  importButton: find.button("import-button"),
  exportButton: find.button("export-button"),
  addClassButton: find.button("add-class-button"),
  classes: find.div("classes"),
  statusContainerClass: "status-container",
  editClassMenu: find.div("edit-class-menu"),
  editClassErrorText: find.any("edit-class-error-text"),
  editClassBackButton: find.button("edit-class-back-button"),
  editClassNameInput: find.input("edit-class-name-input"),
  editClassTypeInput: find.input("edit-class-type-input"),
  editClassColorPicker: find.div("edit-class-color-picker"),
  editClassOptionalSwitch: find.input("edit-class-optional-switch"),
  editClassAddOptionButton: find.button("edit-class-add-option-button"),
  editClassOptions: find.div("edit-class-options"),
  editClassSubmitButton: find.button("edit-class-submit-button"),
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
