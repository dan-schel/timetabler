import { icons } from "./icons";
import { DayOfWeek } from "./time/day-of-week";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableOption } from "./timetable/timetable-option";
import { v4 as uuidv4 } from "uuid";
import { make } from "schel-d-utils-browser";

/** Handles the UI for timetable option within the edit class menu. */
export class EditClassOptionController {
  /** The parent div. */
  readonly $div: HTMLDivElement;

  private readonly _$blocksDiv: HTMLDivElement;

  readonly _blocks: TimetableBlock[];

  /**
   * Creates a {@link EditClassOptionController}.
   * @param $div The parent div.
   */
  constructor($div: HTMLDivElement, $blocksDiv: HTMLDivElement,
    blocks: TimetableBlock[]) {

    this.$div = $div;
    this._$blocksDiv = $blocksDiv;
    this._blocks = blocks;

    this.updateBlocksUI();
  }

  /**
   * Attempts to create a {@link TimetableOption} from the current state of the
   * UI. Must be try-catched, since if the user entered duplicate blocks or
   * other bad data, then this will throw a TimetableError.
   */
  toTimetableOption(): TimetableOption {
    return new TimetableOption(this._blocks);
  }

  /**
   * Recreates the contents of the blocks div. Must be called each time the
   * blocks array is changed for the UI to reflect those changes.
   */
  updateBlocksUI() {
    this._$blocksDiv.replaceChildren(...this._blocks.map(b => {
      const $p = document.createElement("p");
      $p.textContent = b.toDisplayString(true);

      const $ol = document.createElement("div");
      $ol.className = "one-line";
      $ol.append($p);
      return $ol;
    }));
  }

  /**
   * Creates the html elements for a {@link EditClassOptionController}.
   * @param existingOption The existing option, or null for a new option.
   */
  static create(existingOption: TimetableOption | null): EditClassOptionController {
    const $blocksDiv = document.createElement("div");
    $blocksDiv.className = "blocks";

    // "Add another block to this option" button.
    const $plusIcon = make.icon("uil:plus", icons, {});
    const $addBlockButton = document.createElement("button");
    $addBlockButton.classList.add("add-block-button");
    $addBlockButton.title = "Add another block to this option";
    $addBlockButton.append($plusIcon);

    // Day of week selector.
    const $dayOfWeekSelect = document.createElement("select");
    $dayOfWeekSelect.autocomplete = "off";
    DayOfWeek.all().forEach(d =>
      $dayOfWeekSelect.options.add(new Option(
        d.name.slice(0, 3), d.daysSinceMonday.toFixed()
      ))
    );
    const $dayOfWeekSelectArrow = document.createElement("div");
    $dayOfWeekSelectArrow.className = "select-arrow";
    const $dayOfWeekSelectHighlight = document.createElement("div");
    $dayOfWeekSelectHighlight.className = "select-highlight";
    $dayOfWeekSelectHighlight.append($dayOfWeekSelectArrow);
    const $dayOfWeekSelectWrapper = document.createElement("div");
    $dayOfWeekSelectWrapper.className = "select-wrapper";
    $dayOfWeekSelectWrapper.append($dayOfWeekSelect, $dayOfWeekSelectHighlight);

    // Time input.
    const $timeInput = document.createElement("input");
    $timeInput.type = "text";
    $timeInput.placeholder = "11:30am";
    $timeInput.autocomplete = "off";

    // Duration UI (text input + hrs/mins picker).
    const $durationInput = document.createElement("input");
    $durationInput.type = "text";
    $durationInput.placeholder = "3";
    $durationInput.autocomplete = "off";
    const pickerUUID = uuidv4();
    const $unitPickerHrsRadio = document.createElement("input");
    $unitPickerHrsRadio.type = "radio";
    $unitPickerHrsRadio.name = pickerUUID;
    $unitPickerHrsRadio.autocomplete = "off";
    const $unitPickerHrsP = document.createElement("p");
    $unitPickerHrsP.textContent = "hrs";
    const $unitPickerHrsContent = document.createElement("div");
    $unitPickerHrsContent.className = "picker-content";
    $unitPickerHrsContent.append($unitPickerHrsP);
    const $unitPickerHrsLabel = document.createElement("label");
    $unitPickerHrsLabel.append($unitPickerHrsRadio, $unitPickerHrsContent);
    const $unitPickerMinsRadio = document.createElement("input");
    $unitPickerMinsRadio.type = "radio";
    $unitPickerMinsRadio.name = pickerUUID;
    $unitPickerMinsRadio.autocomplete = "off";
    const $unitPickerMinsP = document.createElement("p");
    $unitPickerMinsP.textContent = "mins";
    const $unitPickerMinsContent = document.createElement("div");
    $unitPickerMinsContent.className = "picker-content";
    $unitPickerMinsContent.append($unitPickerMinsP);
    const $unitPickerMinsLabel = document.createElement("label");
    $unitPickerMinsLabel.append($unitPickerMinsRadio, $unitPickerMinsContent);
    const $unitPickerDivider = document.createElement("p");
    $unitPickerDivider.textContent = "/";
    const $unitPickerGroup = document.createElement("div");
    $unitPickerGroup.className = "unit-picker";
    $unitPickerGroup.append(
      $unitPickerHrsLabel, $unitPickerDivider, $unitPickerMinsLabel
    );
    const $durationUI = document.createElement("div");
    $durationUI.className = "duration-ui";
    $durationUI.append($durationInput, $unitPickerGroup);

    // The top row is the day of week select, time input, and duration UI.
    const $topRow = document.createElement("div");
    $topRow.append($dayOfWeekSelectWrapper, $timeInput, $durationUI);

    // Online switch.
    const $onlineSwitchInput = document.createElement("input");
    $onlineSwitchInput.type = "checkbox";
    $onlineSwitchInput.name = "off";
    const $onlineSwitchGraphic = document.createElement("div");
    $onlineSwitchGraphic.classList.add("switch-graphic");
    const $onlineSwitchText = document.createElement("p");
    $onlineSwitchText.textContent = "Online";
    const $onlineSwitchContent = document.createElement("div");
    $onlineSwitchContent.classList.add("switch-content");
    $onlineSwitchContent.append($onlineSwitchText);
    const $onlineSwitchDiv = document.createElement("div");
    $onlineSwitchDiv.append($onlineSwitchGraphic, $onlineSwitchContent);
    const $onlineSwitch = document.createElement("label");
    $onlineSwitch.className = "switch";
    $onlineSwitch.append($onlineSwitchInput, $onlineSwitchDiv);

    // Gap between online switch and buttons.
    const $gap = document.createElement("div");
    $gap.className = "flex-grow";

    // Cancel button.
    const $cancelButton = document.createElement("button");
    $cancelButton.className = "cancel-button";
    $cancelButton.title = "Cancel";
    $cancelButton.append(make.icon("uil:times", icons, {}));

    // Submit button.
    const $submitButton = document.createElement("button");
    $submitButton.className = "submit-button";
    $submitButton.title = "Create timetable block";
    $submitButton.append(make.icon("uil:check", icons, {}));

    // Bottom row consists of the online switch, cancel, and submit buttons.
    const $bottomRow = document.createElement("div");
    $bottomRow.append($onlineSwitch, $gap, $cancelButton, $submitButton);

    // Block editor UI.
    const $blockEditor = document.createElement("div");
    $blockEditor.className = "block-editor";
    $blockEditor.append($topRow, $bottomRow);

    // Parent div.
    const $div = document.createElement("div");
    $div.classList.add("option");
    $div.classList.toggle("editing", existingOption == null);
    $div.append($blocksDiv, $addBlockButton, $blockEditor);

    return new EditClassOptionController(
      $div, $blocksDiv, existingOption?.blocks ?? []
    );
  }
}
