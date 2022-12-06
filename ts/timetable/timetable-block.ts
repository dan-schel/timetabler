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
}
