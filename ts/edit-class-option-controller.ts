import { iconify } from "./iconify";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableOption } from "./timetable/timetable-option";

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
    const $plusIcon = iconify("uil:plus");
    const $addBlockButton = document.createElement("button");
    $addBlockButton.classList.add("add-block-button", "when-not-editing");
    $addBlockButton.title = "Add another block to this option";
    $addBlockButton.append($plusIcon);

    // Parent div.
    const $div = document.createElement("div");
    $div.className = "option";
    $div.append($blocksDiv, $addBlockButton);

    return new EditClassOptionController(
      $div, $blocksDiv, existingOption?.blocks ?? []
    );
  }
}
