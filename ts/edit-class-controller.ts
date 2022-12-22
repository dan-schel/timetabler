import { make } from "schel-d-utils-browser";
import { EditClassOptionPageController } from "./edit-class-option-page-controller";
import { icons } from "./icons";
import { getCurrentTimetable, Html, updateTimetable } from "./main";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableClass } from "./timetable/timetable-class";
import { TimetableColor, TimetableColors } from "./timetable/timetable-class-color";
import { TimetableError } from "./timetable/timetable-error";
import { TimetableOption } from "./timetable/timetable-option";

/** Manages the edit class dialog. */
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

  /** The current options created in the UI. */
  private _options: TimetableOption[];

  private readonly optionPageController: EditClassOptionPageController;

  /**
   * Creates a {@link EditClassController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._existingClass = null;
    this._colorRadios = EditClassController.createColorSwatches(
      this._html.classEditor.colorPicker
    );
    this._options = [];
    this.optionPageController = new EditClassOptionPageController(
      html,
      blocks => this.onOptionPageSubmitted(blocks),
      () => this.closeOptionPage()
    );
    this.attachEvents();
  }

  /** Sets up event handlers. */
  attachEvents() {
    this._html.classEditorDialogCloseButton.addEventListener("click", () => {
      this.close();
    });
    this._html.classEditor.submitButton.addEventListener("click", () => {
      this.onSubmit();
    });
    this._html.classEditor.addOptionButton.addEventListener("click", () => {
      this.optionPageController.reset();
      this._html.classEditorDialog.classList.add("option-page");
    });
  }

  /** Fills in the class colors into the color picker. */
  static createColorSwatches(div: HTMLDivElement) {
    const pickers = TimetableColors.map(c => {
      const dom = make.cssTemplate.pickerButton({}, {});
      dom.$element.classList.add(`gradient-${c}`);
      dom.radio.$element.name = "edit-class-color-picker";
      dom.radio.$element.autocomplete = "off";

      return {
        color: c, $label: dom.$element, $radio: dom.radio.$element
      };
    });

    div.replaceChildren(...pickers.map(p => p.$label));

    return pickers;
  }

  /** Runs when the submit button is clicked. */
  onSubmit() {
    const name = this._html.classEditor.nameInput.value;
    const type = this._html.classEditor.typeInput.value;
    const color = this._colorRadios.find(r => r.$radio.checked)?.color;
    const optional = this._html.classEditor.optionalSwitch.checked;

    if (color == null) {
      this.showError("No colour chosen");
      return;
    }

    try {
      const timetableClass = new TimetableClass(
        name, type, color, this._options, optional
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

    this._html.classEditorDialog.showModal();
    this._html.classEditor.div.classList.toggle("new", existingClass == null);

    if (existingClass != null) {
      this._html.classEditor.nameInput.value = existingClass.name;
      this._html.classEditor.typeInput.value = existingClass.type;
      this._colorRadios.forEach(r => {
        r.$radio.checked = existingClass.color == r.color;
      });
      this._html.classEditor.optionalSwitch.checked = existingClass.optional;
      this.setOptions(existingClass.options);
    }
  }

  /** Closes the dialog. */
  close() {
    this._html.classEditorDialog.close();
  }

  /** Called when the dialog is about to open. Clears any old values. */
  reset() {
    this._html.classEditorDialog.classList.remove("option-page");
    this._html.classEditor.div.classList.remove("new");

    this._html.classEditor.nameInput.value = "";
    this._html.classEditor.typeInput.value = "";
    this._colorRadios.forEach(r => r.$radio.checked = false);
    this._html.classEditor.optionalSwitch.checked = false;
    this.setOptions([]);
    this.showError(null);
  }

  /**
   * Replace the options being shown in the UI with the given ones.
   * @param options The timetable options to display.
   */
  setOptions(options: TimetableOption[]) {
    this._options = options;
    this._html.classEditor.optionsDiv.replaceChildren(...options.map((o, i) => {
      const dom = make.div({ classes: ["option"] }, {
        number: make.p({ classes: ["number"], text: (i + 1).toFixed() }, {}),
        blocks: o.blocks.map(b => {
          return make.div({ classes: ["one-line"] }, {
            text: make.p({ text: b.toDisplayString(true) }, {})
          });
        }),
        deleteButton: make.button({ classes: ["delete-button"] }, {
          icon: make.icon("uil:trash-alt", icons, {})
        })
      });
      dom.deleteButton.$element.addEventListener("click", () => {
        this.deleteOption(o);
      });
      return dom.$element;
    }));
  }

  /**
   * Called when the option page is submitted. Provides the blocks to this
   * controller. Returns an error message if applicable, otherwise null. If
   * accepted, closes the option page.
   * @param blocks The blocks created in the option page.
   */
  onOptionPageSubmitted(blocks: TimetableBlock[]): string | null {
    try {
      const newOption = new TimetableOption(blocks);

      if (this._options.some(o => o.equals(newOption))) {
        return "This option is identical to an existing one in this class";
      }

      this.setOptions([...this._options, newOption]);
      this.closeOptionPage();
      return null;
    }
    catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        return ex.editClassUIMessage;
      }
      console.warn(ex);
      return "Something went wrong";
    }
  }

  /** Closes the option page within the dialog. */
  closeOptionPage() {
    this._html.classEditorDialog.classList.remove("option-page");
  }

  /**
   * Removes an option from the stored options and the UI.
   * @param option The option to remove.
   */
  deleteOption(option: TimetableOption) {
    // Keep all options except this one.
    this.setOptions(this._options.filter(x => !x.equals(option)));
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showError(message: string | null) {
    this._html.classEditor.div.classList.toggle("error", message != null);
    this._html.classEditor.errorText.textContent = message;
  }
}
