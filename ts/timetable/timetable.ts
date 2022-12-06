import { TimetableClass } from "./timetable-class";

/**
 * Represents a timetable. Should be treated as immutable (despite arrays
 * technically being mutable).
 */
export class Timetable {
  /** The classes in the timetable. Can be empty. */
  readonly classes: TimetableClass[];

  /**
   * Creates a {@link Timetable}.
   * @param classes The classes in the timetable. Can be empty.
   */
  constructor(classes: TimetableClass[]) {
    this.classes = classes;
  }
}
