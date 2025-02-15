import { make } from "./utils/_export";
import { OptionEditorController } from "./option-editor-controller";
import { icons } from "./icons";
import { getCurrentTimetable, Html, updateTimetable } from "./main";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableClass } from "./timetable/timetable-class";
import {
  TimetableColor,
  TimetableColors,
} from "./timetable/timetable-class-color";
import { TimetableError } from "./timetable/timetable-error";
import { TimetableOption } from "./timetable/timetable-option";
import { BulkEditorController } from "./bulk-editor-controller";

/** Manages the class editor dialog. */
export class ClassEditorController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /**
   * The original value of the class being edited, or null if we're creating a
   * new class.
   */
  private _existingClass: TimetableClass | null;

  /** References to the HTML elements making up the color picker. */
  private readonly _colorRadios: {
    color: TimetableColor;
    $radio: HTMLInputElement;
  }[];

  /** The current options created in the UI. */
  private _options: TimetableOption[];

  private readonly optionEditorController: OptionEditorController;
  private readonly bulkEditorController: BulkEditorController;

  /**
   * Creates a {@link ClassEditorController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;
    this._existingClass = null;
    this._colorRadios = ClassEditorController.createColorSwatches(
      this._html.classEditor.colorPicker
    );
    this._options = [];
    this.optionEditorController = new OptionEditorController(
      html,
      (blocks) => this.onOptionEditorSubmitted(blocks),
      () => this.closeInnerEditor()
    );
    this.bulkEditorController = new BulkEditorController(
      html,
      (options) => this.onBulkEditorSubmitted(options),
      () => this.closeInnerEditor()
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
      this.optionEditorController.reset();
      this._html.classEditorDialog.classList.add("edit-option");
    });
    this._html.classEditor.pasteOptionsButton.addEventListener("click", () => {
      this.bulkEditorController.reset();
      this._html.classEditorDialog.classList.add("edit-bulk");
    });
  }

  /** Fills in the class colors into the color picker. */
  static createColorSwatches(div: HTMLDivElement) {
    const pickers = TimetableColors.map((c) => {
      const dom = make.cssTemplate.pickerButton({}, {});
      dom.$element.classList.add(`gradient-${c}`);
      dom.radio.$element.name = "edit-class-color-picker";
      dom.radio.$element.autocomplete = "off";

      return {
        color: c,
        $label: dom.$element,
        $radio: dom.radio.$element,
      };
    });

    div.replaceChildren(...pickers.map((p) => p.$label));

    return pickers;
  }

  /** Runs when the submit button is clicked. */
  onSubmit() {
    const name = this._html.classEditor.nameInput.value;
    const type = this._html.classEditor.typeInput.value;
    const color = this._colorRadios.find((r) => r.$radio.checked)?.color;
    const optional = this._html.classEditor.optionalSwitchInput.checked;

    if (color == null) {
      this.showError("No colour chosen");
      return;
    }

    try {
      const timetableClass = new TimetableClass(
        name,
        type,
        color,
        this._options,
        optional
      );

      updateTimetable(
        getCurrentTimetable().withClass(
          timetableClass,
          this._existingClass ?? undefined
        )
      );
      this.close();
    } catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        // Occurs when the error is the user's fault, e.g. they didn't enter
        // a name or have a duplicate option.
        this.showError(ex.editClassUIMessage);
      } else {
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
      this._colorRadios.forEach((r) => {
        r.$radio.checked = existingClass.color === r.color;
      });
      this._html.classEditor.optionalSwitchInput.checked =
        existingClass.optional;
      this.setOptions(existingClass.options as TimetableOption[]);
    }
  }

  /** Closes the dialog. */
  close() {
    this._html.classEditorDialog.close();

    // Reset after the animation plays. Not essential, since we'll reset before
    // we open again, but resets still animate the UI, so it's nice if the reset
    // occurs while the dialog is hidden rather than as it's opening.
    setTimeout(() => this.reset(), 500);
  }

  /** Called when the dialog is about to open. Clears any old values. */
  reset() {
    this._html.classEditorDialog.classList.remove("edit-option");
    this._html.classEditorDialog.classList.remove("edit-bulk");
    this._html.classEditor.div.classList.remove("new");

    this._html.classEditor.nameInput.value = "";
    this._html.classEditor.typeInput.value = "";
    this._colorRadios.forEach((r) => (r.$radio.checked = false));
    this._html.classEditor.optionalSwitchInput.checked = false;
    this.setOptions([]);
    this.showError(null);

    this.optionEditorController.reset();
    this.bulkEditorController.reset();
  }

  /**
   * Replace the options being shown in the UI with the given ones.
   * @param options The timetable options to display.
   */
  setOptions(options: TimetableOption[]) {
    this._options = options;
    this._html.classEditor.div.classList.toggle(
      "non-empty",
      options.length > 0
    );
    this._html.classEditor.optionsDiv.replaceChildren(
      ...options.map((o, i) => {
        const dom = make.div(
          { classes: ["option"] },
          {
            number: make.p(
              { classes: ["number"], text: (i + 1).toFixed() },
              {}
            ),
            blocks: o.blocks.map((b) => {
              return make.div(
                { classes: ["one-line"] },
                {
                  text: make.p({ text: b.toDisplayString(true) }, {}),
                }
              );
            }),
            deleteButton: make.button(
              { classes: ["delete-button"] },
              {
                icon: make.icon("uil:trash-alt", icons, {}),
              }
            ),
          }
        );
        dom.deleteButton.$element.addEventListener("click", () => {
          this.deleteOption(o);
        });
        return dom.$element;
      })
    );
  }

  /**
   * Called when the option editor is submitted. Provides the blocks to this
   * controller. Returns an error message if applicable, otherwise null. If
   * accepted, closes the option editor page.
   * @param blocks The blocks created in the option editor.
   */
  onOptionEditorSubmitted(blocks: TimetableBlock[]): string | null {
    try {
      const newOption = new TimetableOption(blocks);

      if (this._options.some((o) => o.equals(newOption))) {
        return "This option is identical to an existing one in this class";
      }

      this.setOptions([...this._options, newOption]);
      this.closeInnerEditor();
      return null;
    } catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        return ex.editClassUIMessage;
      }
      console.warn(ex);
      return "Something went wrong";
    }
  }

  /**
   * Called when the bulk editor is submitted. Provides the blocks to this
   * controller. Returns an error message if applicable, otherwise null. If
   * accepted, closes the option editor page.
   * @param blocks The blocks created in the option editor.
   */
  onBulkEditorSubmitted(options: TimetableOption[]): string | null {
    try {
      const duplicate = options.find((x) =>
        this._options.some((o) => o.equals(x))
      );
      if (duplicate != null) {
        return `${duplicate.toDisplayString()} is already an option in this class.`;
      }

      this.setOptions([...this._options, ...options]);
      this.closeInnerEditor();
      return null;
    } catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        return ex.editClassUIMessage;
      }
      console.warn(ex);
      return "Something went wrong";
    }
  }

  /** Closes the option editor page within the dialog. */
  closeInnerEditor() {
    this._html.classEditorDialog.classList.remove("edit-option");
    this._html.classEditorDialog.classList.remove("edit-bulk");

    // Reset after the animation plays. Not essential, since we'll reset before
    // we open again, but resets still animate the UI, so it's nice if the reset
    // occurs while the page is hidden rather than as it's opening.
    setTimeout(() => this.optionEditorController.reset(), 500);
    setTimeout(() => this.bulkEditorController.reset(), 500);
  }

  /**
   * Removes an option from the stored options and the UI.
   * @param option The option to remove.
   */
  deleteOption(option: TimetableOption) {
    // Keep all options except this one.
    this.setOptions(this._options.filter((x) => !x.equals(option)));
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
