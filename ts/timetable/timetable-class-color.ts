/** Represents a color that a class on the timetable can use. */
export type TimetableColor = typeof TimetableColors[number];

/** An array of all the possible colors that a timetable class can be. */
export const TimetableColors = [
  "red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"
] as const;

/**
 * Returns true for any valid {@link TimetableColor}.
 * @param val The string to check.
 */
export function isTimetableColor(val: string): val is TimetableColor {
  return (TimetableColors as readonly string[]).includes(val);
}

/**
 * Returns the string as a {@link TimetableColor}, or throws an error
 * is it is invalid.
 * @param val The string to check.
 */
export function toTimetableColor(val: string): TimetableColor {
  if (isTimetableColor(val)) { return val; }
  throw badTimetableColor(val);
}

/** Invalid timetable color "`val`". */
const badTimetableColor = (val: string) => new Error(
  `Invalid timetable color "${val}"`
);
