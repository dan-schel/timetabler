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
  editClassDialog: find.dialog("edit-class-dialog"),
  editClassCloseButton: find.button("edit-class-close-button"),
  editClassMainPage: {
    div: find.div("edit-class-main-page"),
    errorText: find.any("edit-class-main-page-error-text"),
    nameInput: find.input("edit-class-main-page-name-input"),
    typeInput: find.input("edit-class-main-page-type-input"),
    colorPicker: find.div("edit-class-main-page-color-picker"),
    addOptionButton: find.button("edit-class-main-page-add-option-button"),
    optionsDiv: find.div("edit-class-main-page-options"),
    optionalSwitch: find.input("edit-class-main-page-optional-switch"),
    submitButton: find.button("edit-class-main-page-submit-button"),
  },
  editClassOptionPage: {
    div: find.div("edit-class-option-page"),
    backButton: find.button("edit-class-option-page-back-button"),
    errorText: find.any("edit-class-option-page-error-text"),
    dowSelect: find.select("edit-class-option-page-dow-select"),
    timeInput: find.input("edit-class-option-page-time-input"),
    durationInput: find.input("edit-class-option-page-duration-input"),
    durationHoursRadio: find.input("edit-class-option-page-hours-radio"),
    durationMinutesRadio: find.input("edit-class-option-page-minutes-radio"),
    onlineSwitch: find.input("edit-class-option-page-online-switch"),
    addBlockButton: find.button("edit-class-option-page-add-block-button"),
    blocksDivContainer: find.div("edit-class-option-page-blocks-container"),
    blocksDiv: find.div("edit-class-option-page-blocks"),
    submitButton: find.button("edit-class-option-page-submit-button")
  }
};

// Used by other files to refer to the above html object.
export type Html = typeof html;

const controls = new ControlsController(html);

// Set the canvas size and draw. Also have the canvas resize itself when the
// window size changes.
const canvas = new CanvasController(html);
canvas.fitCanvas();
window.addEventListener("resize", () => canvas.fitCanvas());

// Initially, start with an empty timetable.
let timetable = new TimetableChoices(new Timetable([]), []);
updateTimetable(timetable);

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
