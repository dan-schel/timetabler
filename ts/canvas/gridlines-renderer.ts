import { DayOfWeek } from "../time/day-of-week";
import { hour24To12, LocalTime } from "../time/local-time";
import { Timetable } from "../timetable/timetable";
import { TimetableChoices } from "../timetable/timetable-choices";
import { CanvasController } from "./canvas-controller";
import { drawIcon, drawLine, drawText, measureText, rem } from "./utils";

/**
 * If a timetable block starts on a particular day, crosses midnight, and ends
 * after this time on the next day, then part of the block will be rendered in
 * the next day's column. Currently set to 3am. Note that this value will not be
 * used if any timetable blocks start before 3am, in that case the hour of the
 * earliest starting time will be where the split occurs.
 */
export const latestDaySplitHour = 3;

/** The days of the week, from Monday to Friday. */
export const daysMonToFri = [
  DayOfWeek.mon, DayOfWeek.tue, DayOfWeek.wed, DayOfWeek.thu, DayOfWeek.fri
];

/** The days of the week, from Monday to Sunday. */
export const daysMonToSun = [...daysMonToFri, DayOfWeek.sat, DayOfWeek.sun];

/** The default days to show when the timetable is empty. */
export const defaultDays = daysMonToSun;

/** The default start hour to use when the timetable is empty (8am). */
export const defaultStartHour = 8;

/** The default end hour to use when the timetable is empty (8pm). */
export const defaultEndHour = 20;

/** A start and end time number of hours. */
type HourRange = { start: number, end: number; }

/** Handles rendering the timetable gridlines to the canvas. */
export class GridlinesRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** The days of the week to render on the grid. */
  days: DayOfWeek[];

  /** The first hour (24-hour format) to render on the grid. */
  startHour: number;

  /**
   * The last hour (24-hour formal) to render on the grid. Can exceed 24 to show
   * times beyond the end of the day.
   */
  endHour: number;

  /**
   * Creates a {@link GridlinesRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;
    this.days = defaultDays;
    this.startHour = defaultStartHour;
    this.endHour = defaultEndHour;
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    if (timetable.timetable.classes.length > 0) {
      const range = determineHourRange(timetable.timetable);
      this.startHour = range.start;
      this.endHour = range.end;

      const splitTime = LocalTime.fromHour48(this.endHour, 0);
      this.days = timetable.timetable.hasWeekendOptions(splitTime)
        ? daysMonToSun
        : daysMonToFri;
    }
    else {
      this.days = defaultDays;
      this.startHour = defaultStartHour;
      this.endHour = defaultEndHour;
    }
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    this._drawGridlines(ctx);
    this._drawDragPrompt(ctx);
  }

  /** Gets the dimensions for the gridlines measured in pixels. */
  gridDimensions() {
    const timesStart = rem(1);
    const timesWidth = rem(2.5);
    const x1 = timesStart + timesWidth;
    const x2 = this._canvas.width - rem(1);
    const daysStart = rem(1);
    const daysHeight = rem(1.5);
    const y1 = daysStart + daysHeight;
    const y2 = this._canvas.height - rem(1.1 + 1.2 + 1.1);
    const dayWidth = (x2 - x1) / this.days.length;
    const hourHeight = (y2 - y1) / (this.endHour - this.startHour);

    return {
      timesStart: timesStart, timesWidth: timesWidth, x1: x1, x2: x2,
      daysStart: daysStart, daysHeight: daysHeight, y1: y1, y2: y2,
      dayWidth: dayWidth, hourHeight: hourHeight
    };
  }

  /**
   * Gets the (x, y) coordinates for the given time on the given day of week.
   * Automatically rolls times to their spots on the next column if appropriate.
   * @param dayOfWeek The day of week.
   * @param time The time (counts as next day of week if on next day).
   */
  timeLocation(dayOfWeek: DayOfWeek, time: LocalTime) {
    // If the time occurs before the start hour, maybe it should be shown on
    // yesterday's column.
    if (time.fractionalHour48 < this.startHour) {
      if (time.tomorrow().fractionalHour48 > this.endHour) { return null; }
      const dayIndex = this.days.findIndex(d => d.equals(dayOfWeek.yesterday()));
      if (dayIndex == -1) { return null; }
      return { x: dayIndex, y: time.tomorrow().fractionalHour48 - this.startHour };
    }

    // If the time occurs afer the end hour, maybe it should be shown on
    // tomorrow's column.
    if (time.fractionalHour48 > this.endHour) {
      if (time.yesterday().fractionalHour48 < this.startHour) { return null; }
      const dayIndex = this.days.findIndex(d => d.equals(dayOfWeek.tomorrow()));
      if (dayIndex == -1) { return null; }
      return { x: dayIndex, y: time.yesterday().fractionalHour48 - this.startHour };
    }

    // Otherwise, show it on today's column.
    const dayIndex = this.days.findIndex(d => d.equals(dayOfWeek));
    if (dayIndex == -1) { return null; }
    return { x: dayIndex, y: time.fractionalHour48 - this.startHour };
  }

  /**
   * Draws the gridlines and day of week/time labels.
   * @param ctx The canvas context.
   */
  private _drawGridlines(ctx: CanvasRenderingContext2D) {
    const colorInk80 = this._canvas.css.colorInk80;
    const colorInk30 = this._canvas.css.colorInk30;
    const colorInk10 = this._canvas.css.colorInk10;

    const {
      x1, y1, x2, y2, dayWidth, daysStart, hourHeight, timesStart
    } = this.gridDimensions();

    // Draw the line under the column names.
    drawLine(ctx, x1, y1, x2, y1, colorInk30, 2);

    // Draw the vertical lines between columns.
    for (let i = 1; i < this.days.length; i++) {
      const dayDividerX = x1 + dayWidth * i;
      drawLine(ctx, dayDividerX, y1, dayDividerX, y2, colorInk10, 2);
    }

    // Draw the day of week labels.
    const fullLabelMinWidth = rem(4);
    this.days.forEach((dow, i) => {
      // Just use the initial instead of the acronym if the columns aren't wide
      // enough.
      const dayName = dow.codeName.toUpperCase();
      const text = dayWidth > fullLabelMinWidth ? dayName : dayName[0];

      // Draw the label.
      const textWidth = measureText(ctx, text, 1, "bold");
      const textX = x1 + dayWidth * i + (dayWidth - textWidth) / 2;
      const textY = daysStart;
      drawText(ctx, text, textX, textY, 1, "bold", colorInk80);
    });

    const times = [];
    for (let i = this.startHour; i <= this.endHour; i++) {
      const hour12 = hour24To12(i % 24);
      const timeString = `${hour12.hour.toFixed()}${hour12.half}`;
      times.push(timeString);
    }

    times.forEach((text, i) => {
      // Draw the time labels.
      const textX = timesStart;
      const textY = y1 + hourHeight * i - rem(0.75) / 2;
      drawText(ctx, text, textX, textY, 0.75, null, colorInk80);

      // Draw the horizontal lines for each hour.
      if (i != 0) {
        const hourDividerY = y1 + hourHeight * i;
        drawLine(ctx, x1, hourDividerY, x2, hourDividerY, colorInk10, 2);
      }
    });
  }

  /**
   * Draws the "Drag time blocks to switch options" message.
   * @param ctx The canvas context.
   */
  private _drawDragPrompt(ctx: CanvasRenderingContext2D) {
    const width = this._canvas.width;
    const height = this._canvas.height;
    const color = this._canvas.css.colorInk80;

    const iconSizeRem = 1.2;
    const bottomMarginRem = 1.1;
    const gapRem = 0.5;
    const textYOffset = 1.0;

    const text = "Drag blocks to switch options";

    // Measure the width of the text.
    const textWidth = measureText(ctx, text, 1, null);
    const totalWidth = textWidth + rem(iconSizeRem) + rem(gapRem);

    // Draw the "Drag time blocks to switch options" text.
    const textX = (width - totalWidth) / 2 + rem(iconSizeRem) + rem(gapRem);
    const textY = height - rem(bottomMarginRem + textYOffset);
    drawText(ctx, text, textX, textY, 1, null, color);

    // Draw the diagonal arrows icon.
    const icon = new Path2D(
      "M21.92 2.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L4 " +
      "18.59V15a1 1 0 0 0-2 0v6a1 1 0 0 0 .08.38a1 1 0 0 0 .54.54A1 1 0 0 0 " +
      "3 22h6a1 1 0 0 0 0-2H5.41L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38Z"
    );
    const iconX = (width - totalWidth) / 2;
    const iconY = height - rem(bottomMarginRem + iconSizeRem);
    const iconScale = rem(iconSizeRem) / 24;
    drawIcon(ctx, icon, iconX, iconY, iconScale, color);
  }
}

/**
 * Select the hour range to display on the grid, based on the earliest and
 * latest blocks that could be chosen in this timetable.
 * @param timetable The timetable to retrieve block times from.
 */
function determineHourRange(timetable: Timetable): HourRange {
  const earliestHour = timetable.earliestStartTime().startOfHour().hour48;
  const latestHour = timetable.latestEndTime().endOfHour().hour48;
  const split = Math.min(earliestHour, latestDaySplitHour);

  if (latestHour <= 24 || latestHour <= split + 24) {
    return {
      start: earliestHour,
      end: latestHour
    };
  }

  return {
    start: split,
    end: split + 24
  };
}
