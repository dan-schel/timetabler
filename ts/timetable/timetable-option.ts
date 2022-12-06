import { areUnique, arraysMatch } from "schel-d-utils";
import { TimetableBlock } from "./timetable-block";
import { TimetableError } from "./timetable-error";

/**
 * Represents a timetable option for a class. May contain multiple blocks.
 * Should be treated as immutable (despite blocks technically being mutable).
 */
export class TimetableOption {
  /** The timetable blocks this option consists of. Must contain at least 1. */
  readonly blocks: TimetableBlock[];

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

    this.blocks = blocks;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: TimetableOption) {
    return arraysMatch(this.blocks, other.blocks, (a, b) => a.equals(b));
  }
}
