import { posMod } from "@schel-d/js-utils";
import { TimeError } from "./time-error";

const DayOfWeekNumbers = [0, 1, 2, 3, 4, 5, 6] as const;

type DayOfWeekNumber = typeof DayOfWeekNumbers[number];

/**
 * Represents a day of the week value, e.g. Thursday.
 */
export class DayOfWeek {
  /**
   * The number of days this day of the week is away from Monday, e.g. 3 for
   * Thursday. This value will be an integer between 0-6 inclusive.
   */
  readonly daysSinceMonday: DayOfWeekNumber;

  /** Monday. */
  static readonly mon = new DayOfWeek(0);

  /** Tuesday. */
  static readonly tue = new DayOfWeek(1);

  /** Wednesday. */
  static readonly wed = new DayOfWeek(2);

  /** Thursday. */
  static readonly thu = new DayOfWeek(3);

  /** Friday. */
  static readonly fri = new DayOfWeek(4);

  /** Saturday. */
  static readonly sat = new DayOfWeek(5);

  /** Sunday. */
  static readonly sun = new DayOfWeek(6);

  /**
   * Creates a {@link DayOfWeek}.
   * @param daysSinceMonday The number of days this day of the week is away from
   * Monday, e.g. 3 for Thursday.
   */
  constructor(daysSinceMonday: DayOfWeekNumber) {
    this.daysSinceMonday = daysSinceMonday;
  }

  /**
   * Returns the name of the day of the week, e.g. "Thursday" for Thursday.
   */
  get name(): string {
    return names[this.daysSinceMonday].full;
  }

  /**
   * Returns the code name of the day of the week, e.g. "thu" for Thursday.
   */
  get codeName(): string {
    return names[this.daysSinceMonday].codeName;
  }

  /**
   * Returns true if this day of week is either Saturday or Sunday.
   */
  get isWeekend(): boolean {
    return this.daysSinceMonday === 5 || this.daysSinceMonday === 6;
  }

  /**
   * Returns true if this day of week is not Saturday or Sunday.
   */
  get isWeekday(): boolean {
    return !this.isWeekend;
  }

  /**
   * Returns the day of week of the day before this one.
   */
  yesterday(): DayOfWeek {
    return DayOfWeek.fromDaysSinceMonday(posMod(this.daysSinceMonday - 1, 7));
  }

  /**
   * Returns the day of week of the day after this one.
   */
  tomorrow(): DayOfWeek {
    return DayOfWeek.fromDaysSinceMonday(posMod(this.daysSinceMonday + 1, 7));
  }

  /**
   * Returns true if this and {@link other} refer to the same day of week.
   * @param other The other.
   */
  equals(other: DayOfWeek): boolean {
    return this.daysSinceMonday === other.daysSinceMonday;
  }

  /**
   * Creates a {@link DayOfWeek} from an arbitrary number.
   * @param daysSinceMonday The number of days this day of the week is away from
   * Monday, e.g. 3 for Thursday. This value must be an integer between 0-6
   * inclusive, otherwise a {@link TimeError} is thrown.
   */
  static fromDaysSinceMonday(daysSinceMonday: number): DayOfWeek {
    if (
      !Number.isInteger(daysSinceMonday) ||
      daysSinceMonday < 0 ||
      daysSinceMonday >= 7
    ) {
      throw TimeError.invalidDaysSinceMonday(daysSinceMonday);
    }

    return new DayOfWeek(daysSinceMonday as DayOfWeekNumber);
  }

  /**
   * Creates a {@link DayOfWeek} from a (case-insensitive) codename, e.g. "sat"
   * or "Fri".
   * @param codename The codename (case-insensitive), e.g. "sat" or "Fri".
   */
  static tryFromCodeName(codename: string): DayOfWeek | null {
    const num = DayOfWeekNumbers.find(
      (n) => names[n].codeName === codename.toLowerCase()
    );
    if (num == null) {
      return null;
    }
    return new DayOfWeek(num);
  }

  /** Returns all the days of the week. */
  static all(): DayOfWeek[] {
    return [
      DayOfWeek.mon,
      DayOfWeek.tue,
      DayOfWeek.wed,
      DayOfWeek.thu,
      DayOfWeek.fri,
      DayOfWeek.sat,
      DayOfWeek.sun,
    ];
  }
}

/** The names and codenames for each possible {@link DayOfWeekNumber}. */
const names = {
  0: { full: "Monday", codeName: "mon" },
  1: { full: "Tuesday", codeName: "tue" },
  2: { full: "Wednesday", codeName: "wed" },
  3: { full: "Thursday", codeName: "thu" },
  4: { full: "Friday", codeName: "fri" },
  5: { full: "Saturday", codeName: "sat" },
  6: { full: "Sunday", codeName: "sun" },
};
