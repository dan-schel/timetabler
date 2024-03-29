import { areUnique, arraysMatch } from "@dan-schel/js-utils";
import { z } from "zod";
import { DayOfWeek } from "../time/day-of-week";
import { LocalTime } from "../time/local-time";
import { TimetableBlock } from "./timetable-block";
import { TimetableError } from "./timetable-error";

/** Represents a timetable option for a class. May contain multiple blocks. */
export class TimetableOption {
  /** The timetable blocks this option consists of. Must contain at least 1. */
  readonly blocks: readonly TimetableBlock[];

  /** Zod schema for parsing from JSON. */
  static readonly json = z
    .union([
      z
        .string()
        .refine((s) => TimetableBlock.isValidString(s), {
          message:
            'Time blocks should be in the format "day time duration ' +
            '[online]", e.g. "mon 13:00 2h online" or "fri 9:30 90m"',
        })
        .transform((s) => [TimetableBlock.fromString(s)]),
      z
        .string()
        .refine((s) => TimetableBlock.isValidString(s), {
          message:
            'Time blocks should be in the format "day time duration ' +
            '[online]", e.g. "mon 13:00 2h online" or "fri 9:30 90m"',
        })
        .transform((s) => TimetableBlock.fromString(s))
        .array()
        .min(1),
    ])
    .transform((x) => new TimetableOption(x));

  /**
   * Creates a {@link TimetableOption}.
   * @param blocks The timetable blocks this option consists of. Must contain at
   * least 1.
   */
  constructor(blocks: TimetableBlock[]) {
    if (blocks.length < 1) {
      throw TimetableError.optionNoBlocks();
    }

    // Each block in this option must be unique.
    if (!areUnique(blocks, (a, b) => a.equals(b))) {
      throw TimetableError.optionDuplicateBlocks();
    }

    // Blocks within the same option cannot clash.
    if (
      blocks.some((b1) =>
        blocks.some((b2) => !b1.equals(b2) && b1.clashesWith(b2))
      )
    ) {
      throw TimetableError.optionInternalClash();
    }

    this.blocks = blocks;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: TimetableOption) {
    return arraysMatch(
      this.blocks as TimetableBlock[],
      other.blocks as TimetableBlock[],
      (a, b) => a.equals(b)
    );
  }

  /** Convert to JSON object according to {@link TimetableOption.json}. */
  toJSON(): z.input<typeof TimetableOption.json> {
    // If there's just one block output the single string, otherwise output the
    // array of strings.
    return this.blocks.length === 1
      ? this.blocks[0].toString()
      : this.blocks.map((b) => b.toString());
  }

  /**
   * Converts this timetable option to a simple human-friendly string. The
   * string returned doesn't include the durations of the blocks.
   */
  toDisplayString(): string {
    return this.blocks.map((b) => b.toDisplayString(false)).join(" & ");
  }

  /**
   * Returns true if the timetable has classes with weekend options.
   * @param daySplitTime The time after which the end time will be shown on the
   * next day. The time passed here should have the next day flag set.
   */
  hasWeekendBlocks(daySplitTime: LocalTime): boolean {
    return this.blocks.some(
      (b) =>
        b.dayOfWeek.isWeekend ||
        (b.dayOfWeek.equals(DayOfWeek.fri) && b.endTime.isAfter(daySplitTime))
    );
  }

  /** Returns the time the earliest block in this option starts. */
  earliestStartTime(): LocalTime {
    return LocalTime.earliest(...this.blocks.map((x) => x.startTime));
  }

  /** Returns the time the latest block in this option ends. */
  latestEndTime(): LocalTime {
    return LocalTime.latest(...this.blocks.map((x) => x.endTime));
  }
}
