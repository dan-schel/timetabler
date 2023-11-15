import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { Transition } from "./transition";
import {
  drawGradientRoundedRect,
  drawOutlinedGradientRoundedRect,
  drawText,
  measureText,
  rem,
} from "./utils";
import {
  blockTransitionDuration,
  blockTransitionEasing,
  VisualBlock,
} from "./visual-block";

/** The primary visual block (not the overflow block) for a timetable block. */
export class PrimaryVisualBlock extends VisualBlock {
  /** The current value of the animating x-coordinate (day of week). */
  private xTransition: Transition;

  /** The current value of the animating y1-coordinate (start time). */
  private y1Transition: Transition;

  /** The current value of the animating y2-coordinate (end time). */
  private y2Transition: Transition;

  /** Override coords used when dragging. Null if not being dragged. */
  private _dragCoords: { x: number; y1: number; y2: number } | null;

  /** The abbreviated class name to show on the block. */
  private _abbreviatedClassName: string;

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
  constructor(
    canvas: CanvasController,
    gridlines: GridlinesRenderer,
    timetableClass: TimetableClass,
    initialBlock: TimetableBlock,
    initialX: number,
    initialY1: number,
    initialY2: number
  ) {
    super(canvas, gridlines, timetableClass, initialBlock);

    this.xTransition = new Transition(
      this._canvas,
      initialX,
      blockTransitionDuration,
      blockTransitionEasing
    );
    this.y1Transition = new Transition(
      this._canvas,
      initialY1,
      blockTransitionDuration,
      blockTransitionEasing
    );
    this.y2Transition = new Transition(
      this._canvas,
      initialY2,
      blockTransitionDuration,
      blockTransitionEasing
    );
    this._dragCoords = null;

    this._abbreviatedClassName = timetableClass.getAbbreviatedName();
  }

  /**
   * Animates the visual block moving to a new location. Clears any drag
   * coordinates being used.
   * @param newBlock The new timetable block being drawn for.
   * @param newX The new x-coordinate (day of week).
   * @param newY1 The new y1-coordinate (start time).
   * @param newY2 The new y2-coordinate (end time).
   */
  animateTo(
    newBlock: TimetableBlock,
    newX: number,
    newY1: number,
    newY2: number
  ) {
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
      x1: gridX1,
      y1: gridY1,
      dayWidth,
      hourHeight,
    } = this._gridlines.gridDimensions();

    const duration = this.y2Transition.target - this.y1Transition.target;

    // Convert canvas coordinates to table (row/column) coordinates.
    this._dragCoords = {
      x: (canvasX - gridX1) / dayWidth - 0.5,
      y1: (canvasY - gridY1) / hourHeight - duration / 2,
      y2: (canvasY - gridY1) / hourHeight + duration / 2,
    };

    this._canvas.markDirty();
  }

  /** Clear the drag coordinates. Animate back to former position. */
  cancelDrag() {
    if (this._dragCoords == null) {
      return;
    }

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
    // Use drag coordinates if present.
    const x = this._dragCoords?.x ?? this.xTransition.value();
    const y1 = this._dragCoords?.y1 ?? this.y1Transition.value();
    const y2 = this._dragCoords?.y2 ?? this.y2Transition.value();

    const { blockX1, blockY1, blockX2, blockY2, blockWidth, blockHeight } =
      this.dimensions(x, y1, y2);

    const colors = this._canvas.css.classColors[this.timetableClass.color];

    if (this.timetableBlock.online) {
      // Draw online classes as outlined rectangles.
      drawOutlinedGradientRoundedRect(
        ctx,
        blockX1,
        blockY1,
        blockX2,
        blockY2,
        rem(0.5),
        colors.gradient1,
        colors.gradient2,
        this._canvas.css.colorPaper20
      );
    } else {
      // Draw in-person classes as filled rectangles.
      drawGradientRoundedRect(
        ctx,
        blockX1,
        blockY1,
        blockX2,
        blockY2,
        rem(0.5),
        colors.gradient1,
        colors.gradient2
      );
    }

    // Online lines are filled with a similar shade to the background, so choose
    // a text color appropriately.
    const textColor = this.timetableBlock.online
      ? this._canvas.css.colorInk80
      : colors.on;

    // Work out if there's enough space to show the class type as well as the
    // name.
    const typeTextWidth = measureText(
      ctx,
      this.timetableClass.type,
      0.75,
      null
    );
    const showType =
      blockHeight >= rem(3) && blockWidth >= typeTextWidth + rem(1);

    // Draw the name (abbreviated).
    const nameTextWidth = measureText(
      ctx,
      this._abbreviatedClassName,
      1,
      "bold"
    );
    const nameTextX = blockX1 + (blockWidth - nameTextWidth) / 2;
    const nameTextY = blockY1 + (blockHeight - rem(showType ? 2.0 : 1)) / 2;
    drawText(
      ctx,
      this._abbreviatedClassName,
      nameTextX,
      nameTextY,
      1,
      "bold",
      textColor
    );

    // Draw the class type is we determined there was enough space.
    if (showType) {
      const typeTextX = blockX1 + (blockWidth - typeTextWidth) / 2;
      const typeTextY = blockY1 + (blockHeight - rem(2.25)) / 2 + rem(1.25);
      drawText(
        ctx,
        this.timetableClass.type,
        typeTextX,
        typeTextY,
        0.75,
        null,
        textColor
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
      this.xTransition.target,
      this.y1Transition.target,
      this.y2Transition.target
    );

    return x >= blockX1 && x <= blockX2 && y >= blockY1 && y <= blockY2;
  }
}
