import { download, finder, openFileDialog } from "schel-d-utils-browser";
import { CanvasController } from "./canvas-controller";
import { Timetable } from "./timetable/timetable";
import { TimetableChoices } from "./timetable/timetable-choices";

// Retrieve the HTML elements from the page.
const html = {
  controls: finder.any("controls"),
  canvasContainer: finder.div("canvas-container"),
  canvas: finder.canvas("canvas"),
  mobileExpanderButton: finder.button("mobile-expander-button"),
  importButton: finder.button("import-button"),
  exportButton: finder.button("export-button")
};

// Used by other files to refer to the above html object.
export type Html = typeof html;

// Initially, start with an empty timetable.
let timetable = new TimetableChoices(new Timetable([]), []);

// Set the canvas size and draw. Also have the canvas resize itself when the
// window size changes.
const canvas = new CanvasController(html);
canvas.fitCanvas();
window.addEventListener("resize", () => canvas.fitCanvas());

// Toggle the "collapsed" class on the controls when the expander button is
// clicked (only appears when the screen is too small to keep it permanently
// open).
html.mobileExpanderButton.addEventListener("click", () => {
  html.controls.classList.toggle("collapsed");
});

// Import a timetable.
html.importButton.addEventListener("click", () => {
  openFileDialog(".json", (file: string) => {
    const json = JSON.parse(file);
    timetable = new TimetableChoices(Timetable.json.parse(json), []);
  });
});

// Export the timetable.
html.exportButton.addEventListener("click", () => {
  const text = JSON.stringify(timetable.timetable.toJSON());
  download(text, "timetable.json");
});
