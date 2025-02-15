import { nonNull } from "@dan-schel/js-utils";
import { Html } from "./main";
import { DayOfWeek } from "./time/day-of-week";
import { LocalTime } from "./time/local-time";
import {
  tryParseUserArbitraryDurationString,
  tryParseUserTimeString,
} from "./time/parse-user-time-string";
import { TimetableBlock } from "./timetable/timetable-block";
import { TimetableOption } from "./timetable/timetable-option";

const onlineTerms = ["online", "web", "remote", "virtual", "zoom"];

const dowMapping: Record<string, DayOfWeek> = {
  mon: DayOfWeek.mon,
  tue: DayOfWeek.tue,
  wed: DayOfWeek.wed,
  thu: DayOfWeek.thu,
  fri: DayOfWeek.fri,
  sat: DayOfWeek.sat,
  sun: DayOfWeek.sun,
  monday: DayOfWeek.mon,
  tuesday: DayOfWeek.tue,
  wednesday: DayOfWeek.wed,
  thursday: DayOfWeek.thu,
  friday: DayOfWeek.fri,
  saturday: DayOfWeek.sat,
  sunday: DayOfWeek.sun,
};

/** Manages the bulk editor ("paste options") page in the edit class dialog. */
export class BulkEditorController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /** The function called when submitted. Informs the dialog controller. */
  private readonly _callback: (options: TimetableOption[]) => string | null;

  /** Tells the dialog controller to close the page. */
  private readonly _onBack: () => void;

  /**
   * Creates a {@link BulkEditorController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(
    html: Html,
    callback: (options: TimetableOption[]) => string | null,
    onBack: () => void
  ) {
    this._html = html;
    this._callback = callback;
    this._onBack = onBack;
    this.attachEvents();
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
    const parsedOptions: TimetableOption[] = this._parseArbitraryText(
      this._html.bulkEditor.textarea.value
    );

    if (parsedOptions.length > 0) {
      const error = this._callback(parsedOptions);
      if (error != null) {
        this.showError(error);
      }
    } else {
      this.showError("Unable make anything useful of that text");
    }
  }

  /** Called when the page is about to open. Clears any old values. */
  reset() {
    this._html.bulkEditor.textarea.value = "";
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

  private _parseArbitraryText(text: string): TimetableOption[] {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines
      .map((line) => {
        const terms = line
          .split(/\s\s+/)
          .map((term) => term.trim().toLowerCase())
          .filter((term) => term.length > 0);

        const dow = terms.reduce<DayOfWeek | null>(
          (acc, x) => acc ?? dowMapping[x] ?? null,
          null
        );
        const time = terms.reduce<LocalTime | null>(
          (acc, x) => acc ?? tryParseUserTimeString(x),
          null
        );
        const durationMins = terms.reduce<number | null>(
          (acc, x) => acc ?? tryParseUserArbitraryDurationString(x),
          null
        );

        if (dow == null || time == null || durationMins == null) {
          return null;
        }

        const online = onlineTerms.some((x) => terms.includes(x));

        return new TimetableOption([
          new TimetableBlock(dow, time, durationMins, online),
        ]);
      })
      .filter(nonNull);
  }
}
