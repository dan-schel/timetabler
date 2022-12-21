import { EditClassOptionController } from "./edit-class-option-controller";
import { getCurrentTimetable, Html, updateTimetable } from "./main";
import { TimetableClass } from "./timetable/timetable-class";
import { TimetableColor, timetableColorDisplayName, TimetableColors }
  from "./timetable/timetable-class-color";
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

  /** References to the HTML elements making up the color picker. */
  private readonly _colorRadios: {
    color: TimetableColor,
    $radio: HTMLInputElement
  }[];

  private _optionUIs: EditClassOptionController[];

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
    this._optionUIs = [];
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
    this._html.editClassAddOptionButton.addEventListener("click", () => {
      // Only add a new options UI if all the existing ones are being used.
      if (this._optionUIs.every(u => u._blocks.length > 0)) {
        this.setOptionUIs(
          [...this._optionUIs, EditClassOptionController.create(null)]
        );
      }
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
      $label.title = timetableColorDisplayName(c);
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
      const options = this._optionUIs.map(u => u.toTimetableOption());
      const timetableClass = new TimetableClass(
        name, type, color, options, optional
      );

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
    this.reset();
    this._existingClass = existingClass;

    this._html.editClassDialog.showModal();
    this._html.editClassMenu.classList.toggle("new", existingClass == null);

    if (existingClass != null) {
      this._html.editClassNameInput.value = existingClass.name;
      this._html.editClassTypeInput.value = existingClass.type;
      this._colorRadios.forEach(r => {
        r.$radio.checked = existingClass.color == r.color;
      });
      this._html.editClassOptionalSwitch.checked = existingClass.optional;
      this.setOptionUIs(existingClass.options.map(
        o => EditClassOptionController.create(o)
      ));
    }
  }

  /** Closes the dialog. */
  close() {
    this._html.editClassDialog.close();
  }

  /** Called when the dialog is about to open. Clears any old values. */
  reset() {
    this._html.editClassNameInput.value = "";
    this._html.editClassTypeInput.value = "";
    this._colorRadios.forEach(r => r.$radio.checked = false);
    this._html.editClassOptionalSwitch.checked = false;
    this.setOptionUIs([]);
    this.showError(null);
  }

  /**
   * Replace the value of this._optionUIs and attach each option UI to the DOM.
   * @param optionsUI The option UIs.
   */
  setOptionUIs(optionsUI: EditClassOptionController[]) {
    this._optionUIs = optionsUI;
    this._html.editClassOptions.replaceChildren(...optionsUI.map(u => u.$div));
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showError(message: string | null) {
    this._html.editClassMenu.classList.toggle("error", message != null);
    this._html.editClassErrorText.textContent = message;
  }
}
