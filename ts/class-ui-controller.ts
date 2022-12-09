import { TimetableClass } from "./timetable/timetable-class";
import { v4 as uuidv4 } from "uuid";
import { TimetableOption } from "./timetable/timetable-option";
import { getCurrentTimetable, updateTimetable } from "./main";

export type OptionRadioMapping = {
  option: TimetableOption,
  $radio: HTMLInputElement
};

/** Handles creating and managing a single class's UI in the controls. */
export class ClassUIController {
  /** The timetable class. */
  readonly timetableClass: TimetableClass;

  /**
   * The div containing the UI as created by {@link ClassUIController.create}.
   */
  readonly $div: HTMLDivElement;

  /** The radio input used when no choice is selected. */
  private readonly _$noChoiceInput: HTMLInputElement;

  /** A list of each option in the class and the corresponding radio button. */
  private readonly _optionRadios: OptionRadioMapping[];

  /**
   * Creates a {@link ClassUIController}.
   * @param $div The div containing the UI as created by
   * {@link ClassUIController.create}.
   * @param $noChoiceInput The radio input used when no choice is selected.
   * @param optionRadios A list of each option in the class and the
   * corresponding radio button.
   */
  constructor(timetableClass: TimetableClass, $div: HTMLDivElement,
    $noChoiceInput: HTMLInputElement, optionRadios: OptionRadioMapping[]) {

    this.timetableClass = timetableClass;
    this.$div = $div;
    this._$noChoiceInput = $noChoiceInput;
    this._optionRadios = optionRadios;
  }

  /**
   * Highlights the button for the given option.
   * @param option The option.
   */
  select(option: TimetableOption | null) {
    // If the caller wants the "null" (no-choice) option selected, select it.
    if (option == null) {
      if (!this._$noChoiceInput.checked) {
        this._$noChoiceInput.checked = true;
      }
      return;
    }

    const optionRadio = this._optionRadios.find(o => o.option.equals(option));

    // Should never happen. The caller should always pass a valid option.
    if (optionRadio == null) { throw new Error(); }

    if (!optionRadio.$radio.checked) {
      optionRadio.$radio.checked = true;
    }
  }

  /**
   * Creates a {@link ClassUIController} for the given class.
   * @param classData The class data.
   */
  static create(classData: TimetableClass): ClassUIController {
    // The class name label (wrapped in a one-line).
    const $name = document.createElement("h3");
    $name.textContent = classData.name;
    const $nameOL = document.createElement("div");
    $nameOL.className = "one-line";
    $nameOL.append($name);

    // The class name label (wrapped in a one-line).
    const $type = document.createElement("h4");
    $type.textContent = classData.type.toUpperCase();
    const $typeOL = document.createElement("div");
    $typeOL.className = "one-line";
    $typeOL.append($type);

    // The options container.
    const $options = document.createElement("div");
    $options.className = "options";

    // The option labels.
    const radiosName = uuidv4();
    const createOptionUI = ($inner: HTMLElement) => {
      const $input = document.createElement("input");
      $input.type = "radio";
      $input.name = radiosName;
      $input.autocomplete = "off";

      const $button = document.createElement("div");
      $button.className = "button";
      $button.append($inner);

      const $label = document.createElement("label");
      $label.className = "option";
      $label.append($input, $button);

      return { $label: $label, $input: $input };
    };
    const optionUIs = classData.options.map(o => {
      const $text = document.createElement("p");
      $text.textContent = o.toDisplayString();
      const $textOL = document.createElement("div");
      $textOL.className = "one-line";
      $textOL.append($text);

      const ui = createOptionUI($textOL);

      ui.$input.addEventListener("click", () => {
        updateTimetable(getCurrentTimetable().withChoice(classData, o));
      });

      return { option: o, $label: ui.$label, $input: ui.$input };
    });
    const noChoiceOptionUI = (() => {
      const $text = document.createElement("p");
      $text.textContent = "None";
      const $textOL = document.createElement("div");
      $textOL.className = "one-line";
      $textOL.append($text);

      const ui = createOptionUI($textOL);

      ui.$input.addEventListener("click", () => {
        updateTimetable(getCurrentTimetable().withChoice(classData, null));
      });

      return { $label: ui.$label, $input: ui.$input };
    })();
    $options.append(noChoiceOptionUI.$label, ...optionUIs.map(o => o.$label));

    // The parent div.
    const $div = document.createElement("div");
    $div.className = "class";
    $div.append($nameOL, $typeOL, $options);

    const optionRadios = optionUIs.map(o => {
      return { option: o.option, $radio: o.$input };
    });
    return new ClassUIController(
      classData, $div, noChoiceOptionUI.$input, optionRadios
    );
  }
}
