import { LocalTime } from "../time/local-time";

/**
 * The error object used when an invalid Timetable data object is created.
 */
export class TimetableError extends Error {
  /**
   * Creates a {@link TimeError}.
   * @param message The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "TimetableError";
  }

  /**
   * Duration of `durationMins` minutes is not allowed.
   */
  static badDuration(durationMins: number): TimetableError {
    return new TimetableError(
      `Duration of ${durationMins} minutes is not allowed`
    );
  }

  /**
   * A block start time of "`time`" is not allowed.
   */
  static blockBadStartTime(time: LocalTime): TimetableError {
    return new TimetableError(
      `A block start time of "${time.toString(true)}" is not allowed`
    );
  }

  /**
   * An option cannot have no time blocks.
   */
  static optionNoBlocks(): TimetableError {
    return new TimetableError(
      `An option cannot have no time blocks`
    );
  }

  /**
   * An option cannot have duplicate time blocks.
   */
  static optionDuplicateBlocks(): TimetableError {
    return new TimetableError(
      `An option cannot have duplicate time blocks`
    );
  }

  /**
   * A class cannot have no timeslot options.
   */
  static classNoOptions(): TimetableError {
    return new TimetableError(
      `A class cannot have no timeslot options`
    );
  }

  /**
   * A class cannot have duplicate options.
   */
  static classDuplicateOptions(): TimetableError {
    return new TimetableError(
      `A class cannot have duplicate options`
    );
  }
}
