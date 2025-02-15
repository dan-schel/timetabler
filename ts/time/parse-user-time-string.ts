import { tryParseUserTimeString as timeStringUtil } from "@dan-schel/js-utils";
import { LocalTime } from "./local-time";

/**
 * Returns a local time for a timetable block starting time, based on an input
 * string. Several formats are accepted, e.g. 24-hour strings, 12-hour strings,
 * and strings excluding the minutes value. Returns null if the string is not
 * an understood format.
 * @param input The input string.
 */
export function tryParseUserTimeString(input: string): LocalTime | null {
  const time = timeStringUtil(input);
  if (time == null) {
    return null;
  }
  return LocalTime.fromTime(time.hour, time.minute, false);
}

/**
 * Returns an integer number of minutes of a timetable block duration, based on
 * an input string and value indicating whether minutes or hours was chosen as
 * the unit. Returns null if the string is invalid.
 * @param input The input string.
 * @param useMins Whether minutes was chosen as the unit.
 */
export function tryParseUserDurationString(
  input: string,
  useMins: boolean
): number | null {
  const number = parseFloat(input);
  if (Number.isNaN(number)) {
    return null;
  }

  const mins = useMins ? number : number * 60;
  if (!Number.isInteger(mins)) {
    return null;
  }

  return mins;
}

export function tryParseUserArbitraryDurationString(
  input: string
): number | null {
  const hoursMatcher = /([0-9]+) ?hr?s?/g;
  const minsMatcher = /([0-9]+) ?m(in)?s?/g;
  const hoursMatch = hoursMatcher.exec(input);
  const minsMatch = minsMatcher.exec(input);

  if (hoursMatch == null && minsMatch == null) {
    return null;
  }

  let durationMins = 0;
  if (hoursMatch != null) {
    durationMins += parseInt(hoursMatch[1]) * 60;
  }
  if (minsMatch != null) {
    durationMins += parseInt(minsMatch[1]);
  }
  return durationMins;
}
