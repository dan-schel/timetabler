import { areUnique, arraysMatch } from "schel-d-utils";
import { z } from "zod";
import { LocalTime } from "../time/local-time";
import { TimetableColor, TimetableColors } from "./timetable-class-color";
import { TimetableError } from "./timetable-error";
import { TimetableOption } from "./timetable-option";

/**
 * Represents a class (e.g. Advanced Tin Opening Workshop). Should be
 * treated as immutable (despite arrays technically being mutable).
 */
export class TimetableClass {
  /** The class name, e.g. "Advanced Tin Opening". */
  readonly name: string;

  /** The class type, e.g. "Workshop". */
  readonly type: string;

  /** The color this class will be shown on the timetable. */
  readonly color: TimetableColor;

  /** The timetable options. Must have at least 1. */
  readonly options: TimetableOption[];

  /** True, if not adding the class to the timetable is an option. */
  readonly optional: boolean;

  /** Zod schema for parsing from JSON. */
  static readonly json = z.object({
    name: z.string(),
    type: z.string(),
    color: z.enum(TimetableColors),
    options: TimetableOption.json.array().min(1),
    optional: z.boolean().optional()
  }).transform(x =>
    new TimetableClass(x.name, x.type, x.color, x.options, x.optional ?? false)
  );

  /** Zod schema for parsing from JSON but only using raw types. */
  static readonly rawJson = z.object({
    name: z.string(),
    type: z.string(),
    color: z.enum(TimetableColors),
    options: TimetableOption.rawJson.array(),
    optional: z.boolean().optional()
  });

  /**
   * Creates a {@link TimetableClass}.
   * @param name The class name, e.g. "Advanced Tin Opening".
   * @param title The class type, e.g. "Workshop".
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

  /** Convert to JSON object according to {@link TimetableClass.rawJson}. */
  toJSON(): z.infer<typeof TimetableClass.rawJson> {
    return {
      name: this.name,
      type: this.type,
      color: this.color,
      options: this.options.map(o => o.toJSON()),
      optional: this.optional ? true : undefined
    };
  }

  /**
   * Returns true if the timetable has classes with weekend options.
   * @param daySplitTime The time after which the end time will be shown on the
   * next day. The time passed here should have the next day flag set.
   */
  hasWeekendOptions(daySplitTime: LocalTime): boolean {
    return this.options.some(c => c.hasWeekendBlocks(daySplitTime));
  }

  /** Returns the time the earliest block of all the options starts. */
  earliestStartTime(): LocalTime {
    return LocalTime.earliest(...this.options.map(o => o.earliestStartTime()));
  }

  /** Returns the time the latest block of all the options ends. */
  latestEndTime(): LocalTime {
    return LocalTime.latest(...this.options.map(o => o.latestEndTime()));
  }

  /** Returns a three-letter abbreviation suiting the class name. */
  getAbbreviatedName(): string {
    const bits = this.name.toUpperCase().split(" ");
    if (bits.length == 1) {
      if (bits[0].length < 4) {
        return bits[0];
      }
      return bits[0].replace(/[AEIOU]/g, "").slice(0, 3);
    }
    return bits.map(x => x[0]).slice(0, 3).join("");
  }
}
