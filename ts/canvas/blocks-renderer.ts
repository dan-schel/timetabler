import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableChoices } from "../timetable/timetable-choices";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { cubicOut, Transition } from "./transition";
import { drawGradientRoundedRect, rem } from "./utils";

/** The duration of block transition animations. */
const blockTransitionDuration = 0.2;

/** The easing function used for block transition animations. */
const blockTransitionEasing = cubicOut;

/** Handles rendering the timetable blocks to the canvas. */
export class BlocksRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** The gridlines renderer to retrieve grid dimensions from. */
  private readonly _gridlines: GridlinesRenderer;

  private readonly _blocks: VisualBlock[];

  /**
   * Creates a {@link BlocksRenderer}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer) {
    this._canvas = canvas;
    this._gridlines = gridlines;
    this._blocks = [];
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    timetable.choices.forEach(c => {
      const timetableClass = c.timetableClass;

      // Find the blocks already being shown for this class.
      const existingBlocks = this._blocks
        .filter(b => b.timetableClass.equals(timetableClass));

      const timetableBlocks = c.option == null ? [] : c.option.blocks;

      const blockCoordinates = timetableBlocks.map(b => {
        const startLocation = this._gridlines.timeLocation(b.dayOfWeek, b.startTime);
        const endLocation = this._gridlines.timeLocation(b.dayOfWeek, b.endTime);

        if (startLocation == null || endLocation == null) { throw new Error(); }

        const firstBlockEnd = endLocation.x == startLocation.x
          ? endLocation.y
          : this._gridlines.endHour - this._gridlines.startHour;

        return {
          timetableBlock: b,
          main: {
            x: startLocation.x,
            y1: startLocation.y,
            y2: firstBlockEnd
          },
          ghost: null
        };
      });

      existingBlocks.forEach((b, i) => {
        if (blockCoordinates.length > i) {
          const coordinates = blockCoordinates[i];
          b.moveTo(
            coordinates.timetableBlock, coordinates.main.x, coordinates.main.y1,
            coordinates.main.y2
          );
        }
        else {
          this._blocks.splice(this._blocks.indexOf(b), 1);
        }
      });

      if (existingBlocks.length < blockCoordinates.length) {
        blockCoordinates.slice(existingBlocks.length).forEach(b => {
          this._blocks.push(new VisualBlock(
            this._canvas, this._gridlines, timetableClass, b.timetableBlock,
            b.main.x, b.main.y1, b.main.y2, false
          ));
        });
      }
    });
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    this._blocks.forEach(b => b.draw(ctx));
  }
}

/** Handles drawing an allocated section of timetable. */
export class VisualBlock {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** The gridlines renderer to retrieve grid dimensions from. */
  private readonly _gridlines: GridlinesRenderer;

  /** The class this block is for. */
  readonly timetableClass: TimetableClass;

  /** The timetable block being drawn for. */
  timetableBlock: TimetableBlock;

  /** The current value of the animating x-coordinate (day of week). */
  xTransition: Transition;

  /** The current value of the animating y1-coordinate (start time). */
  y1Transition: Transition;

  /** The current value of the animating y2-coordinate (end time). */
  y2Transition: Transition;

  /** Whether this block is marking a block overflowing to the next day. */
  readonly ghost: boolean;

  /**
   * Creates a {@link VisualBlock}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   * @param timetableClass The class this block is for.
   * @param initialBlock The timetable block being drawn for.
   * @param initialX The initial x-coordinate (day of week).
   * @param initialY1 The initial y1-coordinate (start time).
   * @param initialY2 The initial y2-coordinate (end time).
   * @param isGhost Whether this block is marking a block overflowing to the
   * next day.
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer,
    timetableClass: TimetableClass, initialBlock: TimetableBlock,
    initialX: number, initialY1: number, initialY2: number, isGhost: boolean) {

    this._canvas = canvas;
    this._gridlines = gridlines;

    this.timetableClass = timetableClass;
    this.timetableBlock = initialBlock;

    this.xTransition = new Transition(
      this._canvas, initialX, blockTransitionDuration, blockTransitionEasing
    );
    this.y1Transition = new Transition(
      this._canvas, initialY1, blockTransitionDuration, blockTransitionEasing
    );
    this.y2Transition = new Transition(
      this._canvas, initialY2, blockTransitionDuration, blockTransitionEasing
    );

    this.ghost = isGhost;
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
    const { x1, y1, dayWidth, hourHeight } = this._gridlines.gridDimensions();

    const blockX1 = x1 + dayWidth * this.xTransition.value();
    const blockY1 = y1 + hourHeight * this.y1Transition.value();
    const blockX2 = x1 + dayWidth * (this.xTransition.value() + 1);
    const blockY2 = y1 + hourHeight * this.y2Transition.value();

    drawGradientRoundedRect(ctx, blockX1, blockY1, blockX2, blockY2, rem(0.5));
  }
}
