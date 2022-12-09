import { areUnique, arraysMatch } from "schel-d-utils";
import { Timetable } from "./timetable";
import { TimetableClass } from "./timetable-class";
import { TimetableError } from "./timetable-error";
import { TimetableOption } from "./timetable-option";

/**
 * Stores the timetable as well as the currently selected choices for each class
 * in the timetable. Should be treated as immutable (despite arrays technically
 * being mutable).
 */
export class TimetableChoices {
  /** The timetable. */
  readonly timetable: Timetable;

  /**
   * The choices for each class. There must be a choice present representing
   * each class in the timetable.
   */
  readonly choices: TimetableChoice[];

  /**
   * Creates a {@link TimetableChoices}.
   * @param timetable The timetable.
   * @param choices The choices for each class. There must be a choice present
   * representing each class in the timetable.
   */
  constructor(timetable: Timetable, choices: TimetableChoice[]) {
    // Check that the classes present in the choices array match the classes
    // in the timetable. Either array cannot have an element the other does not.
    if (!arraysMatch(choices.map(c => c.timetableClass), timetable.classes)) {
      throw TimetableError.classesChoicesMismatch();
    }

    // Check no classes are present twice in the choices array.
    if (!areUnique(choices.map(c => c.timetableClass), (a, b) => a.equals(b))) {
      throw TimetableError.duplicatedClassInChoices();
    }

    this.timetable = timetable;
    this.choices = choices;
  }
}

/** Represents a choice (or no choice) made for a class in the timetable. */
export class TimetableChoice {
  /** The class the choice is made for. */
  readonly timetableClass: TimetableClass;

  /**
   * The choice made, or null if no choice is made. Note that null may be a
   * valid choice for an optional class.
   */
  readonly option: TimetableOption | null;

  /**
   * Creates a {@link TimetableChoice}.
   * @param timetableClass The class the choice is made for
   * @param option The choice made, or null if no choice is made. Note that null
   * may be a valid choice for an optional class.
   */
  constructor(timetableClass: TimetableClass, option: TimetableOption | null) {
    if (option != null && !timetableClass.options.some(o => o.equals(option))) {
      throw TimetableError.optionMissing();
    }

    this.timetableClass = timetableClass;
    this.option = option;
  }
}
