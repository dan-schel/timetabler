import { TimetableClass } from "./timetable/timetable-class";
import { v4 as uuidv4 } from "uuid";

/** Handles creating and managing a single class's UI in the controls. */
export class ClassUIController {
  /**
   * The div containing the UI as created by {@link ClassUIController.create}.
   */
  $div: HTMLDivElement;

  /**
   * Creates a {@link ClassUIController}.
   * @param $div The div containing the UI as created by
   * {@link ClassUIController.create}.
   */
  constructor($div: HTMLDivElement) {
    this.$div = $div;
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
    $options.append(...classData.options.map(o => {
      const $input = document.createElement("input");
      $input.type = "radio";
      $input.name = radiosName;
      $input.autocomplete = "off";

      const $text = document.createElement("p");
      $text.textContent = o.toDisplayString();

      const $button = document.createElement("div");
      $button.className = "button";
      $button.append($text);

      const $option = document.createElement("label");
      $option.className = "option";
      $option.append($input, $button);

      return $option;
    }));

    // The parent div.
    const $div = document.createElement("div");
    $div.className = "class";
    $div.append($nameOL, $typeOL, $options);

    return new ClassUIController($div);
  }
}
