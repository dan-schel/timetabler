import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { TimetableOption } from "../timetable/timetable-option";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { drawRoundedRect, rem, measureText, drawText, drawOutlinedRoundedRect }
  from "./utils";
import { VisualBlock } from "./visual-block";

/**
 * The suggestion visual block (appears when dragging) for a timetable block.
 */
export class SuggestionVisualBlock extends VisualBlock {
  /** The option this suggestion is part of. */
  readonly option: TimetableOption;

  /** The x-coordinate (day of week). */
  readonly x: number;

  /** The y1-coordinate (start time). */
  readonly y1: number;

  /** The y2-coordinate (end time). */
  readonly y2: number;

  /** An optional label to display on the block. */
  readonly label: string | null;

  /** Whether to show the block as highlighted (when this option is hovered). */
  private _highlighted: boolean;

  /**
   * Creates a {@link OverflowVisualBlock}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   * @param timetableClass The class this block is for.
   * @param option The option this suggestion is part of.
   * @param block The timetable block being drawn for.
   * @param x The x-coordinate (day of week).
   * @param y1 The y1-coordinate (start time).
   * @param x The y2-coordinate (end time).
   * @param label An optional label to display on the block.
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer,
    timetableClass: TimetableClass, option: TimetableOption,
    block: TimetableBlock, x: number, y1: number, y2: number,
    label: string | null) {

    super(canvas, gridlines, timetableClass, block);

    this.option = option;
    this.x = x;
    this.y1 = y1;
    this.y2 = y2;
    this.label = label;
    this._highlighted = false;
  }

  /**
   * Draws the visual block.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const {
      blockX1, blockY1, blockX2, blockY2, blockWidth, blockHeight
    } = this.dimensions(this.x, this.y1, this.y2);

    if (this.timetableBlock.online) {
      // Show online blocks as outlined rectangles.
      drawOutlinedRoundedRect(
        ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5),
        this._highlighted ? this._canvas.css.colorInk30 : this._canvas.css.colorInk10
      );
    }
    else {
      // Show in-person blocks as filled rectangles.
      drawRoundedRect(
        ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5),
        this._highlighted ? this._canvas.css.colorInk30 : this._canvas.css.colorInk10
      );
    }

    // If present, draw the label (which helps identify where blocks are part of
    // the same option).
    if (this.label != null) {
      const textWidth = measureText(ctx, this.label, 2, "bold");
      const textX = blockX1 + (blockWidth - textWidth) / 2;
      const textY = blockY1 + (blockHeight - rem(2)) / 2 + 2;
      drawText(
        ctx, this.label, textX, textY, 2, "bold", this._canvas.css.colorInk30
      );
    }
  }

  /**
   * Returns true if the given coordinates lie inside this visual block.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  isWithin(x: number, y: number) {
    // Ignore animations, use target values.
    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
      this.x, this.y1, this.y2
    );

    return x >= blockX1 && x <= blockX2 && y >= blockY1 && y <= blockY2;
  }

  /**
   * Changes whether the block is shown as highlighted.
   * @param highlighted
   */
  setHighlighted(highlighted: boolean) {
    this._highlighted = highlighted;
    this._canvas.markDirty();
  }
}
