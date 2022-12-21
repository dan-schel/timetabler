import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableOption } from "./timetable/timetable-option";
import { make } from "schel-d-utils-browser";
import { createEditOptionDom } from "./edit-class-option-creator";

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
      return make.div({ classes: ["one-line"] }, {
        text: make.p({ text: b.toDisplayString(true) }, {})
      }).$element;
    }));
  }

  /**
   * Creates the html elements for a {@link EditClassOptionController}.
   * @param existingOption The existing option, or null for a new option.
   */
  static create(existingOption: TimetableOption | null): EditClassOptionController {
    // Parent div.
    const dom = createEditOptionDom();
    dom.$element.classList.toggle("editing", existingOption == null);

    return new EditClassOptionController(
      dom.$element, dom.blocks.$element, existingOption?.blocks ?? []
    );
  }
}
