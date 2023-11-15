import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { drawRoundedRect, rem } from "./utils";
import { VisualBlock } from "./visual-block";

/** The overflow visual block (appears on next day) for a timetable block. */
export class OverflowVisualBlock extends VisualBlock {
  /** The x-coordinate (day of week). */
  readonly x: number;

  /** The y1-coordinate (start time). */
  readonly y1: number;

  /** The y2-coordinate (end time). */
  readonly y2: number;

  /**
   * Creates a {@link OverflowVisualBlock}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   * @param timetableClass The class this block is for.
   * @param block The timetable block being drawn for.
   * @param x The x-coordinate (day of week).
   * @param y1 The y1-coordinate (start time).
   * @param x The y2-coordinate (end time).
   */
  constructor(
    canvas: CanvasController,
    gridlines: GridlinesRenderer,
    timetableClass: TimetableClass,
    block: TimetableBlock,
    x: number,
    y1: number,
    y2: number
  ) {
    super(canvas, gridlines, timetableClass, block);

    this.x = x;
    this.y1 = y1;
    this.y2 = y2;
  }

  /**
   * Draws the visual block.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
      this.x,
      this.y1,
      this.y2
    );

    drawRoundedRect(
      ctx,
      blockX1,
      blockY1,
      blockX2,
      blockY2,
      rem(0.5),
      this._canvas.css.colorInk30
    );
  }
}
