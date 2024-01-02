import { areUnique, arraysMatch } from "@schel-d/js-utils";
import { z } from "zod";
import { LocalTime } from "../time/local-time";
import { TimetableClass } from "./timetable-class";
import { TimetableError } from "./timetable-error";

/** The current version of timetable file this class represents. */
export const version = "2";

/** Represents a timetable. */
export class Timetable {
  /** The classes in the timetable. Can be empty. */
  readonly classes: readonly TimetableClass[];

  /** Zod schema for parsing from JSON. */
  static readonly json = z
    .object({
      version: z.string().refine((s) => s === version),
      classes: TimetableClass.json.array(),
    })
    .transform((x) => new Timetable(x.classes));

  /**
   * Creates a {@link Timetable}.
   * @param classes The classes in the timetable. Can be empty.
   */
  constructor(classes: TimetableClass[]) {
    // Each class in this timetable must be unique.
    if (!areUnique(classes, (a, b) => a.equals(b))) {
      throw TimetableError.timetableDuplicateClasses();
    }

    this.classes = classes;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: Timetable) {
    return arraysMatch(
      this.classes as TimetableClass[],
      other.classes as TimetableClass[],
      (a, b) => a.equals(b)
    );
  }

  /**
   * Returns a new {@link Timetable} that is identical, except with the given
   * class added.
   * @param newClass The new class to add.
   * @param replace The old class to replace (if any). If this class is not
   * found within the timetable, then nothing will change.
   */
  withClass(newClass: TimetableClass, replace?: TimetableClass): Timetable {
    if (replace != null) {
      return new Timetable(
        this.classes.map((x) => (x.equals(replace) ? newClass : x))
      );
    }

    return new Timetable([...this.classes, newClass]);
  }

  /**
   * Returns a new {@link Timetable} that is identical, except with the given
   * class removed.
   * @param oldClass The class to remove.
   */
  withoutClass(oldClass: TimetableClass): Timetable {
    return new Timetable(this.classes.filter((c) => !c.equals(oldClass)));
  }

  /** Convert to JSON object according to {@link Timetable.json}. */
  toJSON(): z.input<typeof Timetable.json> {
    return {
      version: "2",
      classes: this.classes.map((c) => c.toJSON()),
    };
  }

  /**
   * Returns true if the timetable has classes with weekend options.
   * @param daySplitTime The time after which the end time will be shown on the
   * next day. The time passed here should have the next day flag set.
   */
  hasWeekendOptions(daySplitTime: LocalTime): boolean {
    return this.classes.some((c) => c.hasWeekendOptions(daySplitTime));
  }

  /** Returns the time the earliest block option in the timetable starts. */
  earliestStartTime(): LocalTime {
    return LocalTime.earliest(
      ...this.classes.map((c) => c.earliestStartTime())
    );
  }

  /** Returns the time the latest block option in the timetable ends. */
  latestEndTime(): LocalTime {
    return LocalTime.latest(...this.classes.map((c) => c.latestEndTime()));
  }
}
