import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { cubicOut } from "./transition";
import { rem } from "./utils";

/** The duration of block transition animations. */
export const blockTransitionDuration = 0.2;

/** The easing function used for block transition animations. */
export const blockTransitionEasing = cubicOut;

/** Handles drawing an allocated section of timetable. */
export abstract class VisualBlock {
  /** The canvas to draw to. */
  protected readonly _canvas: CanvasController;

  /** The gridlines renderer to retrieve grid dimensions from. */
  protected readonly _gridlines: GridlinesRenderer;

  /** The class this block is for. */
  readonly timetableClass: TimetableClass;

  /** The timetable block being drawn for. */
  timetableBlock: TimetableBlock;

  /**
   * Creates a {@link VisualBlock}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   * @param timetableClass The class this block is for.
   * @param initialBlock The timetable block being drawn for.
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer,
    timetableClass: TimetableClass, initialBlock: TimetableBlock) {

    this._canvas = canvas;
    this._gridlines = gridlines;
    this.timetableClass = timetableClass;
    this.timetableBlock = initialBlock;
  }

  /**
   * Returns the canvas coordinates to draw the rectangle for the block.
   * @param x The column-coordinate the block should be at.
   * @param y1 The row-coordinate of the top of the block.
   * @param y2 The row-coordinate of the bottom of the block.
   */
  dimensions(x: number, y1: number, y2: number) {
    const {
      x1: gridX1, y1: gridY1, dayWidth, hourHeight
    } = this._gridlines.gridDimensions();

    const blockHeight = Math.max(hourHeight * (y2 - y1), rem(1));

    return {
      blockX1: gridX1 + dayWidth * x,
      blockY1: gridY1 + hourHeight * y1,
      blockX2: gridX1 + dayWidth * (x + 1),
      blockY2: gridY1 + hourHeight * y1 + blockHeight,
      blockWidth: dayWidth,
      blockHeight: blockHeight
    };
  }
}
