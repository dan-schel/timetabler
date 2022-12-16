import { getCurrentTimetable, Html, updateTimetable } from "./main";
import { TimetableClass } from "./timetable/timetable-class";
import { TimetableColor, TimetableColors } from "./timetable/timetable-class-color";
import { TimetableError } from "./timetable/timetable-error";

/** Manages the edit class menu. */
export class EditClassController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /**
   * The original value of the class being edited, or null if we're creating a
   * new class.
   */
  private _existingClass: TimetableClass | null;

  private _colorRadios: {
    color: TimetableColor,
    $radio: HTMLInputElement
  }[];

  /**
   * Creates a {@link EditClassController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._existingClass = null;
    this._colorRadios = EditClassController.createColorSwatches(
      this._html.editClassColorPicker
    );
    this.attachEvents();
  }

  /** Sets up event handlers. */
  attachEvents() {
    this._html.editClassBackButton.addEventListener("click", () => {
      this.close();
    });
    this._html.editClassSubmitButton.addEventListener("click", () => {
      this.onSubmit();
    });
  }

  /** Fills in the class colors into the color picker. */
  static createColorSwatches(div: HTMLDivElement) {
    const pickers = TimetableColors.map(c => {
      const $radio = document.createElement("input");
      $radio.type = "radio";
      $radio.name = "edit-class-color-picker";

      const $content = document.createElement("div");
      $content.className = "picker-content";

      const $label = document.createElement("label");
      $label.classList.add(`gradient-${c}`);
      $label.append($radio, $content);

      return {
        color: c, $label: $label, $radio: $radio
      };
    });

    div.replaceChildren(...pickers.map(p => p.$label));

    return pickers;
  }

  /** Runs when the submit button is clicked. */
  onSubmit() {
    const name = this._html.editClassNameInput.value;
    const type = this._html.editClassTypeInput.value;
    const color = this._colorRadios.find(r => r.$radio.checked)?.color;
    const optional = this._html.editClassOptionalSwitch.checked;

    if (color == null) {
      this.showError("No colour chosen");
      return;
    }

    try {
      const timetableClass = new TimetableClass(name, type, color, [], optional);
      updateTimetable(getCurrentTimetable().withClass(
        timetableClass, this._existingClass ?? undefined
      ));
      this.close();
    }
    catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        // Occurs when the error is the user's fault, e.g. they didn't enter
        // a name or have a duplicate option.
        this.showError(ex.editClassUIMessage);
      }
      else {
        // Occurs if the code breaks :/
        this.showError("Something went wrong");
        console.warn(ex);
      }
    }
  }

  /**
   * Opens the menu.
   * @param existingClass The original value of the class being edited, or null
   * if we're creating a new class.
   */
  open(existingClass: TimetableClass | null) {
    this._existingClass = existingClass;

    this._html.controls.classList.add("edit-class");
    this._html.editClassMenu.classList.toggle("new", existingClass == null);

    if (existingClass != null) {
      this._html.editClassNameInput.value = existingClass.name;
      this._html.editClassTypeInput.value = existingClass.type;
      this._colorRadios.forEach(r => {
        r.$radio.checked = existingClass.color == r.color;
      });
      this._html.editClassOptionalSwitch.checked = existingClass.optional;
    }
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showError(message: string | null) {
    this._html.editClassMenu.classList.toggle("error", message != null);
    this._html.editClassErrorText.textContent = message;
  }

  /** Closes the menu. */
  close() {
    this._html.controls.classList.remove("edit-class");

    this._html.editClassNameInput.value = "";
    this._html.editClassTypeInput.value = "";
    this._colorRadios.forEach(r => r.$radio.checked = false);
    this._html.editClassOptionalSwitch.checked = false;
    this.showError(null);
  }
}
