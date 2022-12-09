import { areUnique, arraysMatch } from "schel-d-utils";
import { z } from "zod";
import { TimetableClass } from "./timetable-class";
import { TimetableError } from "./timetable-error";

/** The current version of timetable file this class represents. */
export const version = "2";

/**
 * Represents a timetable. Should be treated as immutable (despite arrays
 * technically being mutable).
 */
export class Timetable {
  /** The classes in the timetable. Can be empty. */
  readonly classes: TimetableClass[];

  /** Zod schema for parsing from JSON. */
  static readonly json = z.object({
    version: z.string().refine(s => s == version),
    classes: TimetableClass.json.array()
  }).transform(x =>
    new Timetable(x.classes)
  );

  /** Zod schema for parsing from JSON but only using raw types. */
  static readonly rawJson = z.object({
    $schema: z.string(),
    version: z.string(),
    classes: TimetableClass.rawJson.array()
  });

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
    return arraysMatch(this.classes, other.classes);
  }

  /** Convert to JSON object according to {@link Timetable.rawJson}. */
  toJSON(): z.infer<typeof Timetable.rawJson> {
    return {
      $schema: "https://timetabler.danschellekens.com/schema-v2.json",
      version: "2",
      classes: this.classes.map(c => c.toJSON())
    };
  }
}
