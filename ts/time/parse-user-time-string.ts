import { hour12To24, parseIntThrow } from "schel-d-utils";
import { LocalTime } from "./local-time";

/**
 * Returns a local time for a timetable block starting time, based on an input
 * string. Several formats are accepted, e.g. 24-hour strings, 12-hour strings,
 * and strings excluding the minutes value. Returns null if the string is not
 * an understood format.
 * @param input The input string.
 */
export function tryParseUserTimeString(input: string): LocalTime | null {
  const standardInput = input.replace(/\s+/g, " ").trim().toLowerCase();

  // Examples of matches: "16:00", "8am", "9:00am", "6.40 pm", "46:99", "14.50"
  // Does NOT match: "8", "1600", "8:0 pm"
  const regex = /^[0-9]{1,2}([:.][0-9]{2}( ?[ap]m)?| ?[ap]m)$/g;

  if (!regex.test(standardInput)) { return null; }

  // Split the string into components, e.g. "9:00am" becomes ["9", "00", "am"]
  // and "14.50" becomes ["14", "50"].
  const components = standardInput
    .replace(" ", "")
    .replace(".", ":")
    .replace("am", ":am")
    .replace("pm", ":pm")
    .split(":");

  // The regex above ensures the first component must be a number.
  const hour = parseIntThrow(components[0]);

  // There will always 2-3 components, but the second component could be either
  // am/pm, or a minute value.
  if (components[1] == "am" || components[1] == "pm") {
    const half = components[1];
    if (hour < 1 || hour > 12) { return null; }

    const minute = 0;
    return LocalTime.fromTime(hour12To24(hour, half), minute, false);
  }

  // If it's not "am" or "pm", then it's guaranteed to be a minute value.
  const minute = parseIntThrow(components[1]);
  if (minute > 59) { return null; }

  if (components.length == 3) {
    const half = components[2] as "am" | "pm";
    if (hour < 1 || hour > 12) { return null; }
    return LocalTime.fromTime(hour12To24(hour, half), minute, false);
  }

  // If there's no third component, then treat the time as a 24-hour time.
  if (hour > 23) { return null; }
  return LocalTime.fromTime(hour, minute, false);
}

/**
 * Returns an integer number of minutes of a timetable block duration, based on
 * an input string and value indicating whether minutes or hours was chosen as
 * the unit. Returns null if the string is invalid.
 * @param input The input string.
 * @param useMins Whether minutes was chosen as the unit.
 */
export function tryParseUserDurationString(input: string,
  useMins: boolean): number | null {

  const number = parseFloat(input);
  if (Number.isNaN(number)) { return null; }

  const mins = useMins ? number : (number * 60);
  if (!Number.isInteger(mins)) { return null; }

  return mins;
}
