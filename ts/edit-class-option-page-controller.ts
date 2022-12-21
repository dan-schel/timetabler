import { make } from "schel-d-utils-browser";
import { icons } from "./icons";
import { Html } from "./main";
import { DayOfWeek } from "./time/day-of-week";
import { LocalTime } from "./time/local-time";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableError } from "./timetable/timetable-error";

/** Manages the option page in the edit class dialog. */
export class EditClassOptionPageController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /** The current blocks created in the UI. */
  private _blocks: TimetableBlock[];

  /** The function called when submitted. Informs the dialog controller. */
  private readonly _callback: (blocks: TimetableBlock[]) => string | null;

  /** Tells the dialog controller to close the page. */
  private readonly _onBack: () => void;

  /**
   * Creates a {@link EditClassOptionPageController}.
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
    this._html.editClassOptionPage.backButton.addEventListener("click", () => {
      this._onBack();
    });
    this._html.editClassOptionPage.submitButton.addEventListener("click", () => {
      this.onSubmitAll();
    });
    this._html.editClassOptionPage.addBlockButton.addEventListener("click", () => {
      this.onAddBlock();
    });
  }

  /** Runs when the "add block" button is clicked. */
  onAddBlock() {
    const startTimeString = this._html.editClassOptionPage.timeInput.value;
    const startTime = LocalTime.fromTime(9, 0);

    const durationString = this._html.editClassOptionPage.durationInput.value;
    const useMins = this._html.editClassOptionPage.durationMinutesRadio.checked;

    const durationMins = 60;

    const online = this._html.editClassOptionPage.onlineSwitch.checked;

    try {
      const dayOfWeek = DayOfWeek.fromDaysSinceMonday(
        parseInt(this._html.editClassOptionPage.dowSelect.value)
      );

      const newBlock = new TimetableBlock(dayOfWeek, startTime, durationMins, online);

      if (this._blocks.some(b => b.equals(newBlock))) {
        this.showError("An identical time block has already been added to this option");
        return;
      }
      if (this._blocks.some(b => b.clashesWith(newBlock))) {
        this.showError("This block clashes with one already added to this option");
        return;
      }

      this.setBlocks([...this._blocks, newBlock]);
      this.resetAddTimeBlockUI();
      this.showError(null);
    }
    catch (ex) {
      if (TimetableError.detect(ex) && ex.editClassUIMessage != null) {
        this.showError(ex.editClassUIMessage);
        return;
      }
      console.warn(ex);
      this.showError("Something went wrong");
    }
  }

  /** Runs when the submit button is clicked. */
  onSubmitAll() {
    if (this._blocks.length > 0) {
      const error = this._callback(this._blocks);
      if (error != null) {
        this.showError(error);
      }
    }
    else {
      this.showError("Please add at least one time block to this option");
    }
  }

  /** Closes the dialog. */
  close() {
    this._html.editClassDialog.close();
  }

  /** Called when the page is about to open. Clears any old values. */
  reset() {
    this.resetAddTimeBlockUI();
    this.setBlocks([]);
    this.showError(null);
  }

  /** Clears the old values in the "Add time block" panel. */
  resetAddTimeBlockUI() {
    this._html.editClassOptionPage.dowSelect.value = "0";
    this._html.editClassOptionPage.timeInput.value = "";
    this._html.editClassOptionPage.durationInput.value = "";
    this._html.editClassOptionPage.durationHoursRadio.checked = true;
    this._html.editClassOptionPage.onlineSwitch.checked = false;
  }

  /**
   * Replace the options being shown in the UI with the given ones.
   * @param options The timetable options to display.
   */
  setBlocks(blocks: TimetableBlock[]) {
    this._blocks = blocks;
    this._html.editClassOptionPage.blocksDivContainer.classList.toggle(
      "non-empty", blocks.length > 0
    );
    this._html.editClassOptionPage.blocksDiv.replaceChildren(...blocks.map(b => {
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
  showError(message: string | null) {
    this._html.editClassOptionPage.div.classList.toggle("error", message != null);
    this._html.editClassOptionPage.errorText.textContent = message;
  }
}
