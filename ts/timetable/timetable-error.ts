import { LocalTime } from "../time/local-time";

/** The error object used when an invalid Timetable data object is created. */
export class TimetableError extends Error {
  /**
   * The error message used for the edit class UI. Can be null if the error
   * is not the fault of the user (and therefore no user friendly string
   * needed).
   */
  readonly editClassUIMessage: string | null;

  /**
   * Creates a {@link TimeError}.
   * @param message The error message (for developer purposes).
   * @param editClassUIMessage The error message used for the edit class UI. Can
   * be null if the error is not the fault of the user (and therefore no user
   * friendly string needed).
   */
  constructor(message: string, editClassUIMessage: string | null) {
    super(message);
    this.name = "TimetableError";
    this.editClassUIMessage = editClassUIMessage;
  }

  /** Returns true if the given object is a {@link TimetableError}. */
  static detect(obj: unknown): obj is TimetableError {
    return typeof obj == "object"
      && obj != null
      && "name" in obj
      && (obj as TimetableError).name == "TimetableError";
  }

  /** A class's name cannot be empty. */
  static classEmptyName(): TimetableError {
    return new TimetableError(
      `A class's name cannot be empty`,
      `Name cannot be empty`
    );
  }

  /** A class cannot have no timeslot options. */
  static classEmptyType(): TimetableError {
    return new TimetableError(
      `A class's type cannot be empty`,
      `Type cannot be empty`
    );
  }

  /** Duration of `durationMins` minutes is not allowed. */
  static badDuration(durationMins: number): TimetableError {
    return new TimetableError(
      `Duration of ${durationMins} minutes is not allowed`,
      `Durations must be between 1 minute and 24 hours`
    );
  }

  /** A block start time of "`time`" is not allowed. */
  static blockBadStartTime(time: LocalTime): TimetableError {
    return new TimetableError(
      `A block start time of "${time.toString(true)}" is not allowed`,
      null
    );
  }

  /** An option cannot have no time blocks. */
  static optionNoBlocks(): TimetableError {
    return new TimetableError(
      `An option cannot have no time blocks`,
      null
    );
  }

  /** An option cannot have duplicate time blocks. */
  static optionDuplicateBlocks(): TimetableError {
    return new TimetableError(
      `An option cannot have duplicate time blocks`,
      "Some options have the same time block twice"
    );
  }

  /** A class cannot have no timeslot options. */
  static classNoOptions(): TimetableError {
    return new TimetableError(
      `A class cannot have no timeslot options`,
      "You must add at least one option"
    );
  }

  /** A class cannot have duplicate options. */
  static classDuplicateOptions(): TimetableError {
    return new TimetableError(
      `A class cannot have duplicate options`,
      "Some options are identical"
    );
  }

  /** A timetable cannot have duplicate classes. */
  static timetableDuplicateClasses(): TimetableError {
    return new TimetableError(
      `A timetable cannot have duplicate classes`,
      "This class is identical to one already on the timetable"
    );
  }

  /** "`val`" is not a valid time block. */
  static badBlockString(val: string): TimetableError {
    return new TimetableError(
      `"${val}" is not a valid time block`,
      null
    );
  }

  /**
   * The classes in the choices array do not match the classes in the timetable.
   */
  static classesChoicesMismatch(): TimetableError {
    return new TimetableError(
      `The classes in the choices array do not match the classes in the ` +
      `timetable`,
      null
    );
  }

  /** The choices array provided had the same class twice. */
  static duplicatedClassInChoices(): TimetableError {
    return new TimetableError(
      `The choices array provided had the same class twice`,
      null
    );
  }

  /** The chosen option doesn't exist for this class. */
  static optionMissing(): TimetableError {
    return new TimetableError(
      `The chosen option doesn't exist for this class`,
      null
    );
  }

  /** The number of choices in the array must match the number of classes. */
  static badChoiceArrayLength(): TimetableError {
    return new TimetableError(
      `The number of choices in the array must match the number of classes`,
      null
    );
  }

  /** The choice index "`index`" was out of range for this class. */
  static badChoiceIndex(index: number): TimetableError {
    return new TimetableError(
      `The choice index "${index}" was out of range for this class`,
      null
    );
  }
}
