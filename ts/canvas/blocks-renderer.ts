import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableChoices } from "../timetable/timetable-choices";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { OverflowVisualBlock, PrimaryVisualBlock } from "./visual-block";

/** Instructions for which visual blocks need to be created for a block. */
export type VisualBlockMapping = {
  block: TimetableBlock,
  main: {
    x: number, y1: number, y2: number
  },
  overflow: {
    x: number, y1: number, y2: number
  } | null
};

/** Handles rendering the timetable blocks to the canvas. */
export class BlocksRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /** The gridlines renderer to retrieve grid dimensions from. */
  private readonly _gridlines: GridlinesRenderer;

  /** The primary visual blocks for each class. */
  private readonly _primaryBlocks: PrimaryVisualBlock[];

  /** The overflow visual blocks for each class (if appropriate). */
  private readonly _overflowBlocks: OverflowVisualBlock[];

  /** The block currently being dragged (if any). */
  private _draggingBlock: PrimaryVisualBlock | null;

  /**
   * Creates a {@link BlocksRenderer}.
   * @param canvas The canvas to draw to.
   * @param gridlines The gridlines renderer to retrieve grid dimensions from.
   */
  constructor(canvas: CanvasController, gridlines: GridlinesRenderer) {
    this._canvas = canvas;
    this._gridlines = gridlines;
    this._primaryBlocks = [];
    this._overflowBlocks = [];
    this._draggingBlock = null;
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // For each choice (a.k.a. each timetable class, since there's guaranteed to
    // be exactly one for each)...
    timetable.choices.forEach(c => {
      // Todo: skip doing everything below if the choice hasn't changed.

      // Get the class and an array of blocks required.
      const timetableClass = c.timetableClass;
      const timetableBlocks = c.option == null ? [] : c.option.blocks;

      // For each block, work out which visual blocks need to be created.
      const newCoordinates: VisualBlockMapping[] = timetableBlocks.map(b => {
        const startLocation = this._gridlines.timeLocation(b.dayOfWeek, b.startTime);
        const endLocation = this._gridlines.timeLocation(b.dayOfWeek, b.endTime);

        // Should never happen.
        if (startLocation == null || endLocation == null) { throw new Error(); }

        // If the start and end columns are different, then an overflow block
        // will be required. Work out where the end of the first block should
        // go.
        const firstBlockEnd = startLocation.x == endLocation.x
          ? endLocation.y
          : this._gridlines.endHour - this._gridlines.startHour;

        // Work out where the overflow block should go (if appropriate).
        let overflow = null;
        if (startLocation.x != endLocation.x) {
          overflow = {
            x: endLocation.x,
            y1: 0,
            y2: endLocation.y
          };
        }

        return {
          block: b,
          main: { x: startLocation.x, y1: startLocation.y, y2: firstBlockEnd },
          overflow: overflow
        };
      });

      // Animate/create/destroy the primary blocks for these new coordinates.
      this.animatePrimaryBlocks(timetableClass, newCoordinates);

      // Create overflow blocks from coordinates. Todo: animate in/out.
      this._overflowBlocks.splice(0, this._overflowBlocks.length);
      newCoordinates.forEach(b => {
        if (b.overflow != null) {
          this._overflowBlocks.push(new OverflowVisualBlock(
            this._canvas, this._gridlines, timetableClass, b.block,
            b.overflow.x, b.overflow.y1, b.overflow.y2
          ));
        }
      });
    });
  }

  /**
   * Animates the existing blocks for a particular class to new coordinates.
   * Creates and destroys blocks if needed so the right amount are shown.
   * @param timetableClass The class to create blocks for.
   * @param newCoordinates The new coordinates to animate the blocks to.
   */
  animatePrimaryBlocks(timetableClass: TimetableClass,
    newCoordinates: VisualBlockMapping[]) {

    // Find the blocks already being shown for this class.
    const existingBlocks = this._primaryBlocks
      .filter(b => b.timetableClass.equals(timetableClass));

    // For each existing block...
    existingBlocks.forEach((b, i) => {
      if (newCoordinates.length > i) {
        // If there are enough new coordinates that this block can be
        // repurposed, then animate it to a new location.
        const coordinates = newCoordinates[i];
        b.animateTo(
          coordinates.block, coordinates.main.x, coordinates.main.y1,
          coordinates.main.y2
        );
      }
      else {
        // If by the time this block is reached in the loop all the new
        // coordinates have blocks assigned, then this block is extra, so delete
        // it. Todo: animate it out!
        this._primaryBlocks.splice(this._primaryBlocks.indexOf(b), 1);
      }
    });

    // If there are more new coordinates than existing blocks, then we'll need
    // to create some new blocks.
    if (newCoordinates.length > existingBlocks.length) {
      newCoordinates.slice(existingBlocks.length).forEach(b => {
        // Todo: animate in the new block.
        this._primaryBlocks.push(new PrimaryVisualBlock(
          this._canvas, this._gridlines, timetableClass, b.block,
          b.main.x, b.main.y1, b.main.y2
        ));
      });
    }
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    this._primaryBlocks.forEach(b => b.draw(ctx));
    this._overflowBlocks.forEach(b => b.draw(ctx));
  }

  /**
   * Called when the mouse is pressed on the canvas.
   * @param e The event details.
   */
  onMouseDown(e: MouseEvent) {
    const x = e.offsetX;
    const y = e.offsetY;
    this._draggingBlock = this._primaryBlocks.find(b => b.isWithin(x, y)) ?? null;
  }

  /**
   * Called when the mouse is released on the canvas.
   * @param e The event details.
   */
  onMouseUp(_e: MouseEvent) {
    if (this._draggingBlock != null) {
      this._draggingBlock.cancelDrag();
    }

    this._draggingBlock = null;
  }

  /**
   * Called when the mouse moves on the canvas.
   * @param e The event details.
   */
  onMouseMove(e: MouseEvent) {
    if (this._draggingBlock != null) {
      const x = e.offsetX;
      const y = e.offsetY;
      this._draggingBlock.dragTo(x, y);
    }
  }
}
