import { areUnique, arraysMatch } from "@dan-schel/js-utils";
import { z } from "zod";
import { LocalTime } from "../time/local-time";
import { TimetableColor, TimetableColors } from "./timetable-class-color";
import { TimetableError } from "./timetable-error";
import { TimetableOption } from "./timetable-option";

/** Represents a class (e.g. Advanced Tin Opening Workshop). */
export class TimetableClass {
  /** The class name, e.g. "Advanced Tin Opening". */
  readonly name: string;

  /** The class type, e.g. "Workshop". */
  readonly type: string;

  /** The color this class will be shown on the timetable. */
  readonly color: TimetableColor;

  /** The timetable options. Must have at least 1. */
  readonly options: readonly TimetableOption[];

  /** True, if not adding the class to the timetable is an option. */
  readonly optional: boolean;

  /** Zod schema for parsing from JSON. */
  static readonly json = z
    .object({
      name: z.string(),
      type: z.string(),
      color: z.enum(TimetableColors, {
        errorMap: (issue, ctx) => {
          if (
            issue.code === "invalid_enum_value" ||
            issue.code === "invalid_type"
          ) {
            return {
              message:
                'Valid colors are "red", "orange", "yellow", ' +
                '"green", "cyan", "blue", "purple", or "pink"',
            };
          }
          return { message: ctx.defaultError };
        },
      }),
      options: TimetableOption.json.array().min(1),
      optional: z.boolean().optional(),
    })
    .transform(
      (x) =>
        new TimetableClass(
          x.name,
          x.type,
          x.color,
          x.options,
          x.optional ?? false
        )
    );

  /**
   * Creates a {@link TimetableClass}.
   * @param name The class name, e.g. "Advanced Tin Opening".
   * @param type The class type, e.g. "Workshop".
   * @param color The color this class will be shown on the timetable.
   * @param options The timetable options. Must have at least 1.
   * @param optional True, if not adding the class to the timetable is an option.
   */
  constructor(
    name: string,
    type: string,
    color: TimetableColor,
    options: TimetableOption[],
    optional: boolean
  ) {
    if (name.length < 1) {
      throw TimetableError.classEmptyName();
    }
    if (type.length < 1) {
      throw TimetableError.classEmptyType();
    }

    if (options.length < 1) {
      throw TimetableError.classNoOptions();
    }

    // Each option in this class must be unique.
    if (!areUnique(options, (a, b) => a.equals(b))) {
      throw TimetableError.classDuplicateOptions();
    }

    this.name = name;
    this.type = type;
    this.color = color;
    this.options = options;
    this.optional = optional;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: TimetableClass) {
    return (
      this.name === other.name &&
      this.type === other.type &&
      this.color === other.color &&
      arraysMatch(
        this.options as TimetableOption[],
        other.options as TimetableOption[],
        (a, b) => a.equals(b)
      ) &&
      this.optional === other.optional
    );
  }

  /** Convert to JSON object according to {@link TimetableClass.json}. */
  toJSON(): z.input<typeof TimetableClass.json> {
    return {
      name: this.name,
      type: this.type,
      color: this.color,
      options: this.options.map((o) => o.toJSON()),
      optional: this.optional ? true : undefined,
    };
  }

  /**
   * Returns true if the timetable has classes with weekend options.
   * @param daySplitTime The time after which the end time will be shown on the
   * next day. The time passed here should have the next day flag set.
   */
  hasWeekendOptions(daySplitTime: LocalTime): boolean {
    return this.options.some((c) => c.hasWeekendBlocks(daySplitTime));
  }

  /** Returns the time the earliest block of all the options starts. */
  earliestStartTime(): LocalTime {
    return LocalTime.earliest(
      ...this.options.map((o) => o.earliestStartTime())
    );
  }

  /** Returns the time the latest block of all the options ends. */
  latestEndTime(): LocalTime {
    return LocalTime.latest(...this.options.map((o) => o.latestEndTime()));
  }

  /** Returns a three-letter abbreviation suiting the class name. */
  getAbbreviatedName(): string {
    const bits = this.name.toUpperCase().split(" ");
    if (bits.length === 1) {
      if (bits[0].length < 4) {
        return bits[0];
      }
      return (
        bits[0][0] +
        bits[0]
          .slice(1)
          .replace(/[AEIOU]/g, "")
          .slice(0, 2)
      );
    }
    return bits
      .map((x) => x[0])
      .slice(0, 3)
      .join("");
  }
}
