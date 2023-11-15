import { hour24To12 } from "@schel-d/js-utils";
import { TimeError } from "./time-error";

/**
 * Represents a time of day as used by a timetable. Local times can also
 * represent times which occur on the next day for timetable purposes (i.e.
 * `minuteOfDay` can be greater than `60 * 24`), but only the next day. These
 * times are independent of a time zone.
 */
export class LocalTime {
  /**
   * The minute of the day, e.g. 74 for 1:14am. Can exceed `60 * 24` to
   * represent times during the following day (for timetable purposes), but
   * no more than one day.
   */
  readonly minuteOfDay: number;

  /**
   * Creates a {@link LocalTime} given a minute of day value.
   * @param minuteOfDay The minute of the day, e.g. 74 for 1:14am. Can exceed
   * `60 * 24` to represent times during the following day (for timetable
   * purposes), but no more than one day, otherwise an error is thrown.
   */
  constructor(minuteOfDay: number) {
    if (
      !Number.isInteger(minuteOfDay) ||
      minuteOfDay < 0 ||
      minuteOfDay >= 60 * 24 * 2
    ) {
      throw TimeError.timeOutOfRange(minuteOfDay);
    }
    this.minuteOfDay = minuteOfDay;
  }

  /**
   * Returns an integer between 0-23 inclusive representing the hour, e.g. 5 for
   * 5:15am, 22 for 10:29pm.
   */
  get hour(): number {
    return this.hour48 % 24;
  }

  /**
   * Returns an integer between 0-59 inclusive representing the minute, e.g. 15
   * for 5:15am, 29 for 10:29pm.
   */
  get minute(): number {
    return this.minuteOfDay % 60;
  }

  /**
   * Returns true if this local time is a time on the "next day".
   * @returns
   */
  get isNextDay(): boolean {
    return this.minuteOfDay >= 24 * 60;
  }

  /**
   * Returns an integer between 0-47 inclusive representing the hour which
   * exceeds 24 for next day times.
   */
  get hour48(): number {
    return Math.floor(this.fractionalHour48);
  }

  /**
   * Returns a (potentially decimal) number between 0-48 representing the number
   * of hours (and fractional minutes) since midnight. Exceeds 24 hours for next
   * day times.
   */
  get fractionalHour48(): number {
    return this.minuteOfDay / 60;
  }

  /**
   * Returns a {@link LocalTime} constructed from a given hour, minute, and
   * optionally assigning next day.
   * @param hour The hour of the day (0 to 23 inclusive).
   * @param minute The minute of the day (0 to 59 inclusive).
   * @param nextDay True if this time occurs on the next day (used for timetable
   * purposes). False if omitted.
   */
  static fromTime(hour: number, minute: number, nextDay = false): LocalTime {
    return new LocalTime((nextDay ? hour + 24 : hour) * 60 + minute);
  }

  /**
   * Returns a {@link LocalTime} constructed from a given hour and minute.
   * @param hour The hour of the day (0 to 47 inclusive). Can exceed 24 for next
   * day.
   * @param minute The minute of the day (0 to 59 inclusive).
   */
  static fromHour48(hour48: number, minute: number): LocalTime {
    return new LocalTime(hour48 * 60 + minute);
  }

  /**
   * Parses a {@link LocalTime} from a string, e.g. "2:04" or "15:28". The
   * string must be in 24-hour format (leading zero not mandatory). To indicate
   * that the time occurs on the next day, use the next day flag, not a ">"
   * character. Returns null on failure.
   * @param value The string, e.g. "2:04" or "15:28".
   * @param nextDay Whether this time occurs on the next day.
   */
  static tryParse(value: string, nextDay = false): LocalTime | null {
    // Checks for 1 or 2 digits, a colon, then 2 digits.
    const correctFormat = /^[0-9]{1,2}:[0-9]{2}$/g.test(value);
    if (!correctFormat) {
      return null;
    }

    const components = value.split(":");

    // Confident this won't ever be NaN or negative because of above regex
    // check.
    const hour = parseInt(components[0]);
    const minute = parseInt(components[1]);
    if (hour >= 24 || minute >= 60) {
      return null;
    }

    return LocalTime.fromTime(hour, minute, nextDay);
  }

  /**
   * Parses a {@link LocalTime} from a string, e.g. "2:04" or "15:28". The
   * string must be in 24-hour format (leading zero not mandatory). To indicate
   * that the time occurs on the next day, use the next day flag, not a ">"
   * character. Throws a {@link TimeError} on failure.
   * @param value The string, e.g. "2:04" or "15:28".
   * @param nextDay Whether this time occurs on the next day.
   */
  static parse(value: string, nextDay = false): LocalTime {
    const val = LocalTime.tryParse(value, nextDay);
    if (val == null) {
      throw TimeError.badTimeString(value);
    }
    return val;
  }

  /**
   * Parses a {@link LocalTime} from a string, e.g. ">2:04" or "15:28". The
   * string must be in 24-hour format (leading zero not mandatory). To indicate
   * that the time occurs on the next day, use a ">" character. Throws a
   * {@link TimeError} on failure.
   * @param value The string, e.g. ">2:04" or "15:28".
   */
  static parseWithMarker(value: string): LocalTime {
    return this.parse(value.replace(">", ""), value.charAt(0) == ">");
  }

  /**
   * Returns the local time as a 24-hour formatted string, e.g. "04:02".
   * @param includeNextDayMarker Whether to prefix times that occur on the next
   * day with ">" symbols, e.g. ">04:02" meaning 4:02am the next day.
   */
  toString(includeNextDayMarker: boolean): string {
    return (
      (this.isNextDay && includeNextDayMarker ? ">" : "") +
      `${this.hour.toFixed().padStart(2, "0")}:` +
      `${this.minute.toFixed().padStart(2, "0")}`
    );
  }

  /**
   * Returns the local time as a 12-hour formatted string, e.g. "4:02am". The
   * next day flag will be ignored.
   */
  to12HString(): string {
    const hour12 = hour24To12(this.hour);

    return (
      `${hour12.hour.toFixed()}:` +
      `${this.minute.toFixed().padStart(2, "0")}${hour12.half}`
    );
  }

  /**
   * Returns true if this time occurs earlier than the {@link other}.
   * @param other The time that if later, results in the method returning true.
   */
  isBefore(other: LocalTime) {
    return this.minuteOfDay < other.minuteOfDay;
  }

  /**
   * Returns true if this time occurs earlier than the {@link other} or the
   * same.
   * @param other The time that if later or the same, results in the method
   * returning true.
   */
  isBeforeOrEqual(other: LocalTime) {
    return this.minuteOfDay <= other.minuteOfDay;
  }

  /**
   * Returns true if this time occurs later than the {@link other}.
   * @param other The time that if earlier, results in the method returning true.
   */
  isAfter(other: LocalTime) {
    return !this.isBeforeOrEqual(other);
  }

  /**
   * Returns true if this time occurs later than the {@link other} or the same.
   * @param other The time that if earlier or the same, results in the method
   * returning true.
   */
  isAfterOrEqual(other: LocalTime) {
    return !this.isBefore(other);
  }

  /**
   * Returns true if this and {@link other} refer to the same time of day.
   * @param other The other.
   */
  equals(other: LocalTime): boolean {
    return this.minuteOfDay == other.minuteOfDay;
  }

  /**
   * Return the same local time, but the non-"next day" version. Throws a
   * {@link TimeError} if this local time is not the "next day" version.
   */
  yesterday(): LocalTime {
    return new LocalTime(this.minuteOfDay - 24 * 60);
  }

  /**
   * Return the same local time, but the "next day" version. Throws a
   * {@link TimeError} if this local time is already the "next day" version.
   */
  tomorrow(): LocalTime {
    return new LocalTime(this.minuteOfDay + 24 * 60);
  }

  /**
   * Returns this time rounded down to the nearest hour (does nothing if the
   * minute component is already 0).
   */
  startOfHour(): LocalTime {
    return LocalTime.fromHour48(this.hour48, 0);
  }

  /**
   * Returns this time rounded up to the nearest hour (does nothing if the
   * minute component is already 0).
   */
  endOfHour(): LocalTime {
    if (this.minute == 0) {
      return this;
    }
    return LocalTime.fromHour48(this.hour48 + 1, 0);
  }

  /**
   * Returns the local time that is set to 12:00am the next day.
   */
  static startOfTomorrow(): LocalTime {
    return new LocalTime(24 * 60);
  }

  /**
   * Returns whichever time is the earliest in the group.
   * @param times The group of times.
   */
  static earliest(...times: LocalTime[]): LocalTime {
    return new LocalTime(Math.min(...times.map((t) => t.minuteOfDay)));
  }

  /**
   * Returns whichever time is the latest in the group.
   * @param times The group of times.
   */
  static latest(...times: LocalTime[]): LocalTime {
    return new LocalTime(Math.max(...times.map((t) => t.minuteOfDay)));
  }
}
