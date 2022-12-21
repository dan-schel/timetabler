import { TimetableClass } from "./timetable/timetable-class";
import { TimetableOption } from "./timetable/timetable-option";
import { dropdowns, getCurrentTimetable, updateTimetable } from "./main";
import { createClassUIDom } from "./class-ui-creator";

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
   * @param onEditClicked Called when the edit button is clicked.
   * @param onDeleteClicked Called when the delete button is clicked.
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
   * @param onEditClicked Called when the edit button is clicked.
   * @param onDeleteClicked Called when the delete button is clicked.
   */
  static create(classData: TimetableClass, onEditClicked: () => void,
    onDeleteClicked: () => void): ClassUIController {

    // Create the DOM for the class UI.
    const { dom, options } = createClassUIDom(classData);

    // The event for the no-choice picker button.
    dom.options.noChoice.radio.$element.addEventListener("click", () => {
      updateTimetable(getCurrentTimetable().withChoice(classData, null));
    });

    // The events for the choices' picker buttons.
    options.forEach(o => {
      o.dom.radio.$element.addEventListener("click", () => {
        updateTimetable(getCurrentTimetable().withChoice(classData, o.option));
      });
    });

    // The logic behind the menu buttons (edit/delete/confirmation).
    const $menuButton = dom.nameRow.menu.menuButton.$element;
    const $dropdownContainer = dom.nameRow.menu.$element;
    const menuDropdown = dom.nameRow.menu.menuDropdown;
    const deleteDropdown = dom.nameRow.menu.deleteDropdown;
    $menuButton.addEventListener("click", () => {
      dropdowns.toggle(menuDropdown.$element, $dropdownContainer);
    });
    menuDropdown.content.editButton.$element.addEventListener("click", () => {
      dropdowns.close();
      onEditClicked();
    });
    menuDropdown.content.deleteButton.$element.addEventListener("click", () => {
      dropdowns.open(deleteDropdown.$element, $dropdownContainer);
    });
    deleteDropdown.content.deleteButton.$element.addEventListener("click", () => {
      dropdowns.close();
      onDeleteClicked();
    });

    // Get references to the inputs form each option for the controller, so that
    // when a choice is changed outside this UI (e.g. from a drag on the canvas)
    // the checked one can be updated.
    const optionRadios = options.map(o => {
      return { option: o.option, $radio: o.dom.radio.$element };
    });

    return new ClassUIController(
      classData, dom.$element, dom.options.noChoice.radio.$element, optionRadios
    );
  }
}
