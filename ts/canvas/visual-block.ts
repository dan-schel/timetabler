import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { cubicOut, Transition } from "./transition";
import { drawGradientRoundedRect, rem, drawRoundedRect } from "./utils";

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

/** The primary visual block (not the ghost) for a timetable block. */
export class PrimaryVisualBlock extends VisualBlock {
  /** The current value of the animating x-coordinate (day of week). */
  xTransition: Transition;

  /** The current value of the animating y1-coordinate (start time). */
  y1Transition: Transition;

  /** The current value of the animating y2-coordinate (end time). */
  y2Transition: Transition;

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
  }

  /**
   * Animates the visual block moving to a new location.
   * @param newBlock The new timetable block being drawn for.
   * @param newX The new x-coordinate (day of week).
   * @param newY1 The new y1-coordinate (start time).
   * @param newY2 The new y2-coordinate (end time).
   */
  moveTo(newBlock: TimetableBlock, newX: number, newY1: number, newY2: number) {
    this.timetableBlock = newBlock;
    this.xTransition.animateTo(newX);
    this.y1Transition.animateTo(newY1);
    this.y2Transition.animateTo(newY2);
  }

  /**
   * Draws the visual block.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
      this.xTransition.value(), this.y1Transition.value(),
      this.y2Transition.value()
    );
    const colors = this._canvas.css.classColors[this.timetableClass.color];

    drawGradientRoundedRect(
      ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5), colors.gradient1,
      colors.gradient2
    );
  }
}

/** The primary visual block (not the ghost) for a timetable block. */
export class GhostVisualBlock extends VisualBlock {
  /** The x-coordinate (day of week). */
  readonly x: number;

  /** The y1-coordinate (start time). */
  readonly y1: number;

  /** The y2-coordinate (end time). */
  readonly y2: number;

  /**
   * Creates a {@link GhostVisualBlock}.
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
