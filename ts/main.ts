import { find } from "./utils/_export";
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
  classEditorDialog: find.dialog("class-editor-dialog"),
  classEditorDialogCloseButton: find.button("class-editor-dialog-close-button"),
  aboutLink: find.anchor("about-link"),
  aboutDialog: find.dialog("about-dialog"),
  aboutDialogCloseButton: find.button("about-dialog-close-button"),
  classEditor: {
    div: find.div("class-editor"),
    errorText: find.any("class-editor-error-text"),
    nameInput: find.input("class-editor-name-input"),
    typeInput: find.input("class-editor-type-input"),
    colorPicker: find.div("class-editor-color-picker"),
    addOptionButton: find.button("class-editor-add-option-button"),
    pasteOptionsButton: find.button("class-editor-paste-options-button"),
    optionsDiv: find.div("class-editor-options"),
    optionalSwitchInput: find.input("class-editor-optional-switch-input"),
    submitButton: find.button("class-editor-submit-button"),
  },
  optionEditor: {
    div: find.div("option-editor"),
    backButton: find.button("option-editor-back-button"),
    submitErrorText: find.any("option-editor-submit-error-text"),
    blockErrorText: find.any("option-editor-block-error-text"),
    dowSelect: find.select("option-editor-dow-select"),
    timeInput: find.input("option-editor-time-input"),
    durationInput: find.input("option-editor-duration-input"),
    durationHoursRadio: find.input("option-editor-hours-radio"),
    durationMinutesRadio: find.input("option-editor-minutes-radio"),
    onlineSwitch: find.input("option-editor-online-switch"),
    addBlockButton: find.button("option-editor-add-block-button"),
    blocksDivContainer: find.div("option-editor-blocks-container"),
    blocksDiv: find.div("option-editor-blocks"),
    submitButton: find.button("option-editor-submit-button"),
  },
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

// <EXPERIMENTAL>
// This might help fix the iOS Safari bug which occasionally happens on load
// where the timetable is rendered funny?
setTimeout(() => canvas.markDirty(), 1000);
// </EXPERIMENTAL>

// If the browser supports it, detect changes to "prefers-color-scheme" and
// update the canvas appropriately.
const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
if (darkMode.addEventListener) {
  darkMode.addEventListener("change", () => canvas.refreshCSS());
}
if (darkMode.addListener) {
  darkMode.addListener(() => canvas.refreshCSS());
}

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
