import { areUnique, arraysMatch } from "schel-d-utils";
import { TimetableColor } from "./timetable-class-color";
import { TimetableError } from "./timetable-error";
import { TimetableOption } from "./timetable-option";

/**
 * Represents a class (e.g. Advanced Programming Techniques Lecture). Should be
 * treated as immutable (despite arrays technically being mutable).
 */
export class TimetableClass {
  /** The class name, e.g. "Advanced Programming Techniques". */
  readonly name: string;

  /** The class type, e.g. "Lecture". */
  readonly type: string;

  /** The color this class will be shown on the timetable. */
  readonly color: TimetableColor;

  /** The timetable options. Must have at least 1. */
  readonly options: TimetableOption[];

  /** True, if not adding the class to the timetable is an option. */
  readonly optional: boolean;

  /**
   * Creates a {@link TimetableClass}.
   * @param name The class name, e.g. "Advanced Programming Techniques".
   * @param title The class type, e.g. "Lecture".
   * @param color The color this class will be shown on the timetable.
   * @param options The timetable options. Must have at least 1.
   * @param optional True, if not adding the class to the timetable is an option.
   */
  constructor(name: string, title: string, color: TimetableColor,
    options: TimetableOption[], optional: boolean) {

    if (options.length < 1) {
      throw TimetableError.classNoOptions();
    }

    // Each option in this class must be unique.
    if (!areUnique(options, (a, b) => a.equals(b))) {
      throw TimetableError.classDuplicateOptions();
    }

    this.name = name;
    this.type = title;
    this.color = color;
    this.options = options;
    this.optional = optional;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: TimetableClass) {
    return this.name === other.name
      && this.type === other.type
      && this.color === other.color
      && arraysMatch(this.options, other.options)
      && this.optional === other.optional;
  }
}
