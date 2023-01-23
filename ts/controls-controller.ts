import { download, openFileDialog } from "schel-d-utils-browser";
import { ClassUIController } from "./class-ui-controller";
import { ClassEditorController } from "./class-editor-controller";
import { getCurrentTimetable, Html, updateTimetable } from "./main";
import { TimetableChoices } from "./timetable/timetable-choices";
import { ZodError } from "zod";
import { TimetableError } from "./timetable/timetable-error";

/** Manages the controls UI (the side-panel). */
export class ControlsController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /**
   * A copy of the currently displayed timetable purely for comparison to the
   * new data.
   */
  private _prevTimetable: TimetableChoices | null;

  /** The currently active class UIs. */
  private _classUIs: ClassUIController[];

  /** The logic in charge of the edit class menu. */
  private _classEditorController: ClassEditorController;

  /**
   * Creates a {@link ControlsController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._prevTimetable = null;
    this._classUIs = [];
    this._classEditorController = new ClassEditorController(html);

    this.attachEvents();
  }

  /** Sets up event handlers. */
  attachEvents() {
    // Toggle the "collapsed" class on the controls when the expander button is
    // clicked (only appears when the screen is too small to keep it permanently
    // open).
    this._html.mobileExpanderButton.addEventListener("click", () => {
      this._html.controls.classList.toggle("collapsed");
    });

    // Import a timetable.
    this._html.importButton.addEventListener("click", () => {
      openFileDialog(".json", (file: string) => {
        const newTimetable = (() => {
          try {
            const json = JSON.parse(file);
            return TimetableChoices.json.parse(json);
          }
          catch (err) {
            this.onTimetableParseError(err);
          }
        })();

        if (newTimetable != null) {
          updateTimetable(newTimetable);
        }
      });
    });

    // Export the timetable.
    this._html.exportButton.addEventListener("click", () => {
      const timetable = getCurrentTimetable();
      if (timetable.timetable.classes.length < 1) { return; }

      const json = {
        $schema: "https://timetabler.danschellekens.com/schema-v2.json",
        ...timetable.toJSON()
      };
      const text = JSON.stringify(json);
      download(text, "timetable.json");
    });

    // Open the edit class menu when "Add class" button clicked.
    this._html.addClassButton.addEventListener("click", () => {
      this._classEditorController.open(null);

      // Make sure if the screen size changes while the dialog is open, it
      // doesn't result in the controls being collapsed (again).
      this._html.controls.classList.remove("collapsed");
    });

    // Open/close the about dialog.
    this._html.aboutLink.addEventListener("click", () => {
      this._html.aboutDialog.showModal();
    });
    this._html.aboutDialogCloseButton.addEventListener("click", () => {
      this._html.aboutDialog.close();
    });
  }

  /**
   * Called when an error occurs parsing an imported timetable JSON file.
   * @param err The error.
   */
  onTimetableParseError(err: unknown) {
    if (err instanceof ZodError) {
      const message = err.issues[0].message;

      // Create a nice path string, e.g. "<root>.classes[0].name".
      const path = "<root>" + err.issues[0].path.map(x => {
        if (typeof x === "number") {
          return `[${x.toFixed()}]`;
        }
        return `.${x}`;
      }).join("");
      alert(`That .json file is invalid: ${message} (at ${path})`);
      console.warn(err);
      return null;
    }
    if (TimetableError.detect(err) && err.importMessage != null) {
      alert(`That .json file is invalid: ${err.importMessage}`);
      console.warn(err);
      return null;
    }

    alert("That .json file is invalid.");
    console.warn(err);
    return null;
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

        const onEditClicked = () => {
          this._classEditorController.open(cl);
        };
        const onDeleteClicked = () => {
          updateTimetable(getCurrentTimetable().withoutClass(cl));
        };
        const ui = ClassUIController.create(cl, onEditClicked, onDeleteClicked);
        ui.select(choice.option);

        return ui;
      });

      this._html.classes.replaceChildren(...this._classUIs.map(u => u.$div));

      // Disable export for empty timetables.
      this._html.exportButton.disabled = timetable.timetable.classes.length < 1;
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
