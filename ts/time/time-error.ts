/**
 * The error object used when an invalid LocalTime or DayOfWeek operation
 * occurs.
 */
export class TimeError extends Error {
  /**
   * Creates a {@link TimeError}.
   * @param message The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "TimeError";
  }

  /**
   * Minute of day "`minuteOfDay`" is out of range for a LocalTime.
   */
  static timeOutOfRange(minuteOfDay: number): TimeError {
    return new TimeError(
      `Minute of day "${minuteOfDay}" is out of range for a LocalTime.`
    );
  }

  /**
   * String "`value`" cannot be interpreted as a LocalTime.
   */
  static badTimeString(value: string): TimeError {
    return new TimeError(
      `String "${value}" cannot be interpreted as a LocalTime.`
    );
  }

  /**
   * "`value`" is not a valid days since Monday number for a day of
   * week.
   */
  static invalidDaysSinceMonday(value: number): TimeError {
    return new TimeError(
      `"${value}" is not a valid days since Monday number for a day of week.`
    );
  }
}
