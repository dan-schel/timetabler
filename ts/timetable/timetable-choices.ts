import { areUnique, arraysMatch } from "schel-d-utils";
import { Timetable } from "./timetable";
import { TimetableClass } from "./timetable-class";
import { TimetableOption } from "./timetable-option";

/**
 * Mutable object that stores the timetable as well as the currently selected
 * choices for each class in the timetable.
 */
export class TimetableChoices {
  /** The timetable. */
  timetable: Timetable;

  /**
   * The choices (which may be null if not chosen yet, or class is optional)
   * for each class, matching the indexing in the timetable. This array must
   * always match the length of the classes in timetable.
   */
  choices: TimetableChoice[];

  /**
   * Creates a {@link TimetableChoices}.
   * @param timetable The timetable.
   * @param choices The choices (which may be null if not chosen yet, or class
   * is optional) for each class, matching the indexing in the timetable. This
   * array must always match the length of the classes in timetable.
   */
  constructor(timetable: Timetable, choices: TimetableChoice[]) {
    // Don't bother checking the validity of choices here.
    this.timetable = timetable;
    this.choices = choices;
  }

  /**
   * Returns true if each class is present (once) in the array and every choice
   * is valid.
   */
  isValid(): boolean {
    // Ensure there are no duplicates (areUnique), that every class is present
    // (arraysMatch), and every choice is valid (isValid).
    return areUnique(this.choices.map(c => c.timetableClass), (a, b) => a.equals(b))
      && arraysMatch(this.choices.map(c => c.timetableClass), this.timetable.classes)
      && this.choices.every(c => c.isValid());
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
    this.timetableClass = timetableClass;
    this.option = option;
  }

  /**
   * Returns false if the option is not an option for this class, or an option
   * is not chosen and the class is not optional.
   */
  isValid(): boolean {
    const option = this.option;

    // Option can only be null if the class is optional.
    if (option == null) {
      return this.timetableClass.optional;
    }

    // Otherwise ensure the class has this as an option.
    return this.timetableClass.options.some(o => o.equals(option));
  }
}
