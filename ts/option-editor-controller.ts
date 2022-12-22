import { make } from "schel-d-utils-browser";
import { icons } from "./icons";
import { Html } from "./main";
import { DayOfWeek } from "./time/day-of-week";
import { tryParseUserDurationString, tryParseUserTimeString }
  from "./time/parse-user-time-string";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableError } from "./timetable/timetable-error";

/** Manages the option page in the edit class dialog. */
export class OptionEditorController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /** The current blocks created in the UI. */
  private _blocks: TimetableBlock[];

  /** The function called when submitted. Informs the dialog controller. */
  private readonly _callback: (blocks: TimetableBlock[]) => string | null;

  /** Tells the dialog controller to close the page. */
  private readonly _onBack: () => void;

  /**
   * Creates a {@link OptionEditorController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html, callback: (blocks: TimetableBlock[]) => string | null,
    onBack: () => void) {
    this._html = html;
    this._blocks = [];
    this._callback = callback;
    this._onBack = onBack;
    this.attachEvents();
  }

  /** Sets up event handlers. */
  attachEvents() {
    this._html.optionEditor.backButton.addEventListener("click", () => {
      this._onBack();
    });
    this._html.optionEditor.submitButton.addEventListener("click", () => {
      this.onSubmitAll();
    });
    this._html.optionEditor.addBlockButton.addEventListener("click", () => {
      this.onAddBlock();
    });
  }

  /** Runs when the "add block" button is clicked. */
  onAddBlock() {
    try {
      // Should always work (unless someone messed with DevTools) since the
      // select options have values set for the days since Monday.
      const dayOfWeek = DayOfWeek.fromDaysSinceMonday(
        parseInt(this._html.optionEditor.dowSelect.value)
      );

      const startTimeString = this._html.optionEditor.timeInput.value;
      if (startTimeString.length < 1) {
        this.showBlockError(`Please enter a start time`);
        return;
      }

      const startTime = tryParseUserTimeString(startTimeString);
      if (startTime == null) {
        this.showBlockError(
          `Cannot understand start time, try formatting it like "3:30pm" or ` +
          `"16:00"`
        );
        return;
      }

      const durationString = this._html.optionEditor.durationInput.value;
      if (durationString.length < 1) {
        this.showBlockError(`Please enter a duration`);
        return;
      }

      const useMins = this._html.optionEditor.durationMinutesRadio.checked;
      const durationMins = tryParseUserDurationString(durationString, useMins);
      if (durationMins == null) {
        this.showBlockError(
          `The duration must be a number, and a whole number of minutes ` +
          `(e.g. 2.5 minutes is not allowed)`
        );
        return;
      }

      const online = this._html.optionEditor.onlineSwitch.checked;
      const newBlock = new TimetableBlock(
        dayOfWeek, startTime, durationMins, online
      );

      if (this._blocks.some(b => b.equals(newBlock))) {
        this.showBlockError(
          "An identical time block has already been added to this option"
        );
        return;
      }
      if (this._blocks.some(b => b.clashesWith(newBlock))) {
        this.showBlockError(
          "This block clashes with one already added to this option"
        );
        return;
      }

      this.setBlocks([...this._blocks, newBlock]);
      this.resetAddTimeBlockUI();
      this.showBlockError(null);
    }
    catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        this.showBlockError(ex.editClassUIMessage);
        return;
      }
      console.warn(ex);
      this.showBlockError("Something went wrong");
    }
  }

  /** Runs when the submit button is clicked. */
  onSubmitAll() {
    if (this._blocks.length > 0) {
      const error = this._callback(this._blocks);
      if (error != null) {
        this.showSubmitError(error);
      }
    }
    else {
      this.showSubmitError("Please add at least one time block to this option");
    }
  }

  /** Called when the page is about to open. Clears any old values. */
  reset() {
    this.resetAddTimeBlockUI();
    this.setBlocks([]);
    this.showSubmitError(null);
    this.showBlockError(null);
  }

  /** Clears the old values in the "Add time block" panel. */
  resetAddTimeBlockUI() {
    this._html.optionEditor.dowSelect.value = "0";
    this._html.optionEditor.timeInput.value = "";
    this._html.optionEditor.durationInput.value = "";
    this._html.optionEditor.durationHoursRadio.checked = true;
    this._html.optionEditor.onlineSwitch.checked = false;
  }

  /**
   * Replace the options being shown in the UI with the given ones.
   * @param options The timetable options to display.
   */
  setBlocks(blocks: TimetableBlock[]) {
    this._blocks = blocks;
    this._html.optionEditor.blocksDivContainer.classList.toggle(
      "non-empty", blocks.length > 0
    );
    this._html.optionEditor.blocksDiv.replaceChildren(...blocks.map(b => {
      const dom = make.div({ classes: ["block"] }, {
        block: make.div({ classes: ["one-line"] }, {
          text: make.p({ text: b.toDisplayString(true) }, {})
        }),
        deleteButton: make.button({ classes: ["delete-button"] }, {
          icon: make.icon("uil:trash-alt", icons, {})
        })
      });
      dom.deleteButton.$element.addEventListener("click", () => {
        this.deleteBlock(b);
      });
      return dom.$element;
    }));
  }

  /**
   * Removes a block from the stored blocks and the UI.
   * @param block The block to remove.
   */
  deleteBlock(block: TimetableBlock) {
    // Keep all blocks except this one.
    this.setBlocks(this._blocks.filter(x => !x.equals(block)));
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showSubmitError(message: string | null) {
    this._html.optionEditor.div.classList.remove("block-error");
    this._html.optionEditor.div.classList.toggle("submit-error", message != null);
    this._html.optionEditor.submitErrorText.textContent = message;
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showBlockError(message: string | null) {
    this._html.optionEditor.div.classList.remove("submit-error");
    this._html.optionEditor.div.classList.toggle("block-error", message != null);
    this._html.optionEditor.blockErrorText.textContent = message;
  }
}
