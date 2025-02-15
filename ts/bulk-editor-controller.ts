import { Html } from "./main";
import { TimetableBlock } from "./timetable/timetable-block";

/** Manages the bulk editor ("paste options") page in the edit class dialog. */
export class BulkEditorController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /** The function called when submitted. Informs the dialog controller. */
  private readonly _callback: (blocks: TimetableBlock[]) => string | null;

  /** Tells the dialog controller to close the page. */
  private readonly _onBack: () => void;

  /**
   * Creates a {@link BulkEditorController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(
    html: Html,
    callback: (blocks: TimetableBlock[]) => string | null,
    onBack: () => void
  ) {
    this._html = html;
    this._callback = callback;
    this._onBack = onBack;
    this.attachEvents();
    console.log("ashdasd");
  }

  /** Sets up event handlers. */
  attachEvents() {
    this._html.bulkEditor.backButton.addEventListener("click", () => {
      this._onBack();
    });
    this._html.bulkEditor.submitButton.addEventListener("click", () => {
      this.onSubmit();
    });
  }

  /** Runs when the submit button is clicked. */
  onSubmit() {
    const parsedBlocks: TimetableBlock[] = [];

    if (parsedBlocks.length > 0) {
      const error = this._callback(parsedBlocks);
      if (error != null) {
        this.showError(error);
      }
    } else {
      this.showError("No, bad.");
    }
  }

  /** Called when the page is about to open. Clears any old values. */
  reset() {
    // TODO: Clear the text.
    this.showError(null);
  }

  /**
   * Shows an error message, or clears it.
   * @param message The message to show, or null to clear the message.
   */
  showError(message: string | null) {
    this._html.bulkEditor.div.classList.toggle("error", message != null);
    this._html.bulkEditor.errorText.textContent = message;
  }
}
