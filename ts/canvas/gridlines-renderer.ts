import { DayOfWeek } from "../time/day-of-week";
import { hour24To12, LocalTime } from "../time/local-time";
import { Timetable } from "../timetable/timetable";
import { TimetableChoices } from "../timetable/timetable-choices";
import { CanvasController } from "./canvas-controller";
import { drawIcon, drawLine, drawText, measureText, toPx } from "./utils";

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

/** Handles rendering the timetable gridlines to the canvas. */
export class GridlinesRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** The days of the week to render on the grid. */
  private _days: DayOfWeek[];

  /** The first hour (24-hour format) to render on the grid. */
  private _startHour: number;

  /**
   * The last hour (24-hour formal) to render on the grid. Can exceed 24 to show
   * times beyond the end of the day.
   */
  private _endHour: number;

  /**
   * Creates a {@link GridlinesRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;
    this._days = defaultDays;
    this._startHour = defaultStartHour;
    this._endHour = defaultEndHour;
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    if (timetable.timetable.classes.length > 0) {
      const range = determineHourRange(timetable.timetable);
      this._startHour = range.start;
      this._endHour = range.end;

      const splitTime = LocalTime.fromHour48(this._endHour, 0);
      this._days = timetable.timetable.hasWeekendOptions(splitTime)
        ? daysMonToSun
        : daysMonToFri;
    }
    else {
      this._days = defaultDays;
      this._startHour = defaultStartHour;
      this._endHour = defaultEndHour;
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

  /**
   * Draws the gridlines and day of week/time labels.
   * @param ctx The canvas context.
   */
  private _drawGridlines(ctx: CanvasRenderingContext2D) {
    const width = this._canvas.width;
    const height = this._canvas.height;
    const colorInk80 = this._canvas.css.colorInk80;
    const colorInk30 = this._canvas.css.colorInk30;
    const colorInk10 = this._canvas.css.colorInk10;

    const x1 = 16 * 3.5;
    const y1 = 16 * 1;
    const x2 = width - 16 * 1;
    const y2 = height - 16 * (1.1 + 1.2 + 1.1);
    const colWidth = (x2 - x1) / this._days.length;
    const colHeaderHeight = 16 * 2;

    // Draw the line under the column names.
    const mainDividerY = y1 + colHeaderHeight;
    drawLine(ctx, x1, mainDividerY, x2, mainDividerY, colorInk30, 2);

    // Draw the vertical lines between columns.
    for (let i = 1; i < this._days.length; i++) {
      const dayDividerX = x1 + colWidth * i;
      drawLine(ctx, dayDividerX, y1, dayDividerX, y2, colorInk10, 2);
    }

    // Draw the day of week labels.
    const fullLabelMinWidth = toPx(4);
    this._days.forEach((dow, i) => {
      // Just use the initial instead of the acronym if the columns aren't wide
      // enough.
      const dayName = dow.codeName.toUpperCase();
      const text = colWidth > fullLabelMinWidth ? dayName : dayName[0];

      // Draw the label.
      const textWidth = measureText(ctx, text, 1, "bold");
      const textX = x1 + colWidth * i + (colWidth - textWidth) / 2;
      const textY = y1 + (colHeaderHeight - toPx(1.0)) / 2 - 1;
      drawText(ctx, text, textX, textY, 1, "bold", colorInk80);
    });

    const times = [];
    for (let i = this._startHour; i <= this._endHour; i++) {
      const hour12 = hour24To12(i % 24);
      const timeString = `${hour12.hour.toFixed()}${hour12.half}`;
      times.push(timeString);
    }
    const rowHeight = (y2 - y1 - colHeaderHeight) / (times.length - 1);

    times.forEach((text, i) => {
      // Draw the time labels.
      const textX = toPx(1);
      const textY = y1 + colHeaderHeight + rowHeight * i - toPx(0.75) / 2;
      drawText(ctx, text, textX, textY, 0.75, null, colorInk80);

      // Draw the horizontal lines for each hour.
      if (i != 0) {
        const hourDividerY = y1 + colHeaderHeight + rowHeight * i;
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
    const totalWidth = textWidth + toPx(iconSizeRem) + toPx(gapRem);

    // Draw the "Drag time blocks to switch options" text.
    const textX = (width - totalWidth) / 2 + toPx(iconSizeRem) + toPx(gapRem);
    const textY = height - toPx(bottomMarginRem + textYOffset);
    drawText(ctx, text, textX, textY, 1, null, color);

    // Draw the diagonal arrows icon.
    const icon = new Path2D(
      "M21.92 2.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L4 " +
      "18.59V15a1 1 0 0 0-2 0v6a1 1 0 0 0 .08.38a1 1 0 0 0 .54.54A1 1 0 0 0 " +
      "3 22h6a1 1 0 0 0 0-2H5.41L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38Z"
    );
    const iconX = (width - totalWidth) / 2;
    const iconY = height - toPx(bottomMarginRem + iconSizeRem);
    const iconScale = toPx(iconSizeRem) / 24;
    drawIcon(ctx, icon, iconX, iconY, iconScale, color);
  }
}

type HourRange = { start: number, end: number; }

/**
 * Select the hour range to display on the grid, based on the earliest and
 * latest blocks that could be chosen in this timetable.
 * @param timetable The timetable to retrieve block times from.
 */
function determineHourRange(timetable: Timetable): HourRange {
  const earliestHour = timetable.earliestStartTime().startOfHour().hour48;
  const latestHour = timetable.latestEndTime().endOfHour().hour48;
  const split = Math.min(earliestHour, latestDaySplitHour);

  if (latestHour <= 24 || latestHour < split + 24) {
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
