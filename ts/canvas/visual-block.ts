import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { TimetableOption } from "../timetable/timetable-option";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { cubicOut, Transition } from "./transition";
import { drawGradientRoundedRect, rem, drawRoundedRect, drawText, measureText }
  from "./utils";

/** The duration of block transition animations. */
const blockTransitionDuration = 0.2;

/** The easing function used for block transition animations. */
const blockTransitionEasing = cubicOut;

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

    return {
      blockX1: gridX1 + dayWidth * x,
      blockY1: gridY1 + hourHeight * y1,
      blockX2: gridX1 + dayWidth * (x + 1),
      blockY2: gridY1 + hourHeight * y2
    };
  }
}

/** The primary visual block (not the overflow block) for a timetable block. */
export class PrimaryVisualBlock extends VisualBlock {
  /** The current value of the animating x-coordinate (day of week). */
  private xTransition: Transition;

  /** The current value of the animating y1-coordinate (start time). */
  private y1Transition: Transition;

  /** The current value of the animating y2-coordinate (end time). */
  private y2Transition: Transition;

  /** Override coords used when dragging. Null if not being dragged. */
  private _dragCoords: { x: number, y1: number, y2: number } | null;

  /**
   * Creates a {@link PrimaryVisualBlock}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   * @param timetableClass The class this block is for.
   * @param initialBlock The timetable block being drawn for.
   * @param initialX The initial x-coordinate (day of week).
   * @param initialY1 The initial y1-coordinate (start time).
   * @param initialY2 The initial y2-coordinate (end time).
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer,
    timetableClass: TimetableClass, initialBlock: TimetableBlock,
    initialX: number, initialY1: number, initialY2: number) {

    super(canvas, gridlines, timetableClass, initialBlock);

    this.xTransition = new Transition(
      this._canvas, initialX, blockTransitionDuration, blockTransitionEasing
    );
    this.y1Transition = new Transition(
      this._canvas, initialY1, blockTransitionDuration, blockTransitionEasing
    );
    this.y2Transition = new Transition(
      this._canvas, initialY2, blockTransitionDuration, blockTransitionEasing
    );
    this._dragCoords = null;
  }

  /**
   * Animates the visual block moving to a new location. Clears any drag
   * coordinates being used.
   * @param newBlock The new timetable block being drawn for.
   * @param newX The new x-coordinate (day of week).
   * @param newY1 The new y1-coordinate (start time).
   * @param newY2 The new y2-coordinate (end time).
   */
  animateTo(newBlock: TimetableBlock, newX: number, newY1: number, newY2: number) {
    if (this._dragCoords != null) {
      this.xTransition.jumpTo(this._dragCoords.x);
      this.y1Transition.jumpTo(this._dragCoords.y1);
      this.y2Transition.jumpTo(this._dragCoords.y2);
      this._dragCoords = null;
    }

    this.timetableBlock = newBlock;
    this.xTransition.animateTo(newX);
    this.y1Transition.animateTo(newY1);
    this.y2Transition.animateTo(newY2);
  }

  /**
   * Assigns drag coordinates using the given canvas coordinates (in pixels).
   * @param canvasX The x coordinate on the canvas (in pixels).
   * @param canvasY The y coordinate on the canvas (in pixels).
   */
  dragTo(canvasX: number, canvasY: number) {
    const {
      x1: gridX1, y1: gridY1, dayWidth, hourHeight
    } = this._gridlines.gridDimensions();

    const duration = this.y2Transition.target - this.y1Transition.target;

    this._dragCoords = {
      x: (canvasX - gridX1) / dayWidth - 0.5,
      y1: (canvasY - gridY1) / hourHeight - duration / 2,
      y2: (canvasY - gridY1) / hourHeight + duration / 2,
    };

    this._canvas.draw(true);
  }

  /** Clear the drag coordinates. Animate back to former position. */
  cancelDrag() {
    if (this._dragCoords == null) { return; }

    const oldX = this.xTransition.target;
    this.xTransition.jumpTo(this._dragCoords.x);
    this.xTransition.animateTo(oldX);

    const oldY1 = this.y1Transition.target;
    this.y1Transition.jumpTo(this._dragCoords.y1);
    this.y1Transition.animateTo(oldY1);

    const oldY2 = this.y2Transition.target;
    this.y2Transition.jumpTo(this._dragCoords.y2);
    this.y2Transition.animateTo(oldY2);

    this._dragCoords = null;
  }

  /**
   * Draws the visual block.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const x = this._dragCoords?.x ?? this.xTransition.value();
    const y1 = this._dragCoords?.y1 ?? this.y1Transition.value();
    const y2 = this._dragCoords?.y2 ?? this.y2Transition.value();

    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(x, y1, y2);
    const colors = this._canvas.css.classColors[this.timetableClass.color];

    drawGradientRoundedRect(
      ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5), colors.gradient1,
      colors.gradient2
    );
  }

  /**
   * Returns true if the given coordinates lie inside this visual block.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  isWithin(x: number, y: number) {
    // Ignore animations, use target values.
    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
      this.xTransition.target, this.y1Transition.target,
      this.y2Transition.target
    );

    return x >= blockX1 && x <= blockX2 && y >= blockY1 && y <= blockY2;
  }
}

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
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer,
    timetableClass: TimetableClass, block: TimetableBlock, x: number,
    y1: number, y2: number) {

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
      this.x, this.y1, this.y2
    );
    drawRoundedRect(
      ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5),
      this._canvas.css.colorInk30
    );
  }
}

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
    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
      this.x, this.y1, this.y2
    );
    drawRoundedRect(
      ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5),
      this._highlighted ? this._canvas.css.colorInk30 : this._canvas.css.colorInk10
    );

    if (this.label != null) {
      const textWidth = measureText(ctx, this.label, 2, "bold");
      const textX = blockX1 + (blockX2 - blockX1 - textWidth) / 2;
      const textY = blockY1 + (blockY2 - blockY1 - rem(2)) / 2 + 2;
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
    // Todo: mark canvas as dirty (for redraw).
  }
}
