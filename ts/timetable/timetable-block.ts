import { parseIntNull } from "schel-d-utils";
import { DayOfWeek } from "../time/day-of-week";
import { LocalTime } from "../time/local-time";
import { TimetableError } from "./timetable-error";

/** Represents a time block that is part of a timetable option. Is immutable. */
export class TimetableBlock {
  /** The day of the week. */
  readonly dayOfWeek: DayOfWeek;

  /** The start time. Cannot occur on the next day. */
  readonly startTime: LocalTime;

  /** The duration in minutes. Must be an integer between 1 min - 24 hrs. */
  readonly durationMins: number;

  /** True, if this time block is completed online. */
  readonly online: boolean;

  /**
   * Creates a {@link TimetableBlock}.
   * @param dayOfWeek The day of the week.
   * @param startTime The start time.
   * @param durationMins The duration in minutes. Must be an integer between 1
   * min - 24 hrs.
   * @param online True, if this time block is completed online.
   */
  constructor(dayOfWeek: DayOfWeek, startTime: LocalTime, durationMins: number,
    online: boolean) {

    if (startTime.isNextDay) {
      throw TimetableError.blockBadStartTime(startTime);
    }
    if (!Number.isInteger(durationMins) || durationMins < 1 || durationMins > 24 * 60) {
      throw TimetableError.badDuration(durationMins);
    }

    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.durationMins = durationMins;
    this.online = online;
  }

  /**
   * Returns true if the given object has an identical value to this one.
   * @param other The other object.
   */
  equals(other: TimetableBlock) {
    return this.dayOfWeek.equals(other.dayOfWeek)
      && this.startTime.equals(other.startTime)
      && this.durationMins === other.durationMins
      && this.online === other.online;
  }

  /**
   * Parses a {@link TimetableBlock} from a string, e.g. "mon 13:00 2h online"
   * or "fri 9:30 90m". Returns null on failure.
   * @param value The string, e.g. "mon 13:00 2h online" or "fri 9:30 90m".
   */
  static tryFromString(value: string): TimetableBlock | null {
    const bits = value.trim().split(" ").filter(s => s.length != 0);
    if (bits.length != 3 && bits.length != 4) { return null; }

    const dayOfWeek = DayOfWeek.tryFromCodeName(bits[0]);
    if (dayOfWeek == null) { return null; }

    const startTime = LocalTime.tryParse(bits[1]);
    if (startTime == null) { return null; }

    const durationStr = bits[2];
    const durationNum = parseIntNull(durationStr.substring(0, durationStr.length - 1));
    if (durationNum == null) { return null; }
    const durationMins = durationStr.endsWith("h") ? durationNum * 60 : durationNum;

    let online = false;
    if (bits.length == 4) {
      if (bits[3] != "online") { return null; }
      online = true;
    }

    return new TimetableBlock(dayOfWeek, startTime, durationMins, online);
  }

  /**
   * Parses a {@link TimetableBlock} from a string, e.g. "mon 13:00 2h online"
   * or "fri 9:30 90m". Throws a {@link TimetableError} on failure.
   * @param value The string, e.g. "mon 13:00 2h online" or "fri 9:30 90m".
   */
  static fromString(value: string): TimetableBlock {
    const block = TimetableBlock.tryFromString(value);
    if (block == null) { throw TimetableError.badBlockString(value); }
    return block;
  }

  /**
   * Returns true if the given string is a valid timetable block string, e.g.
   * "mon 13:00 2h online" or "fri 9:30 90m".
   * @param value The string, e.g. "mon 13:00 2h online" or "fri 9:30 90m".
   */
  static isValidString(value: string): boolean {
    return this.tryFromString(value) != null;
  }

  /**
   * Converts this timetable block to a string, e.g. "mon 13:00 2h online" or
   * "fri 9:30 90m".
   */
  toString(): string {
    const dow = this.dayOfWeek.codeName;
    const time = this.startTime.toString(false);

    // Use hours for duration if possible.
    const duration = this.durationMins % 60 == 0
      ? `${this.durationMins / 60}h`
      : `${this.durationMins}m`;

    return this.online
      ? `${dow} ${time} ${duration} online`
      : `${dow} ${time} ${duration}`;
  }

  /**
   * Converts this timetable block to a simple human-friendly string. The string
   * returned doesn't include the duration.
   */
  toDisplayString(): string {
    // Like the codename, but with a starting capital letter.
    const dow = this.dayOfWeek.name.substring(0, 3);

    const onlineSuffix = this.online ? " online" : "";
    return `${dow} ${this.startTime.to12HString()}${onlineSuffix}`;
  }
}
