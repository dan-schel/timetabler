import { getCurrentTimetable, updateTimetable } from "../main";
import { TimetableBlock } from "../timetable/timetable-block";
import { TimetableChoices } from "../timetable/timetable-choices";
import { TimetableClass } from "../timetable/timetable-class";
import { CanvasController } from "./canvas-controller";
import { GridlinesRenderer } from "./gridlines-renderer";
import { OverflowVisualBlock } from "./overflow-visual-block";
import { PrimaryVisualBlock } from "./primary-visual-block";
import { SuggestionVisualBlock } from "./suggestion-visual-block";

/** Instructions for which visual blocks need to be created for a block. */
export type VisualBlockMapping = {
  block: TimetableBlock;
  main: {
    x: number;
    y1: number;
    y2: number;
  };
  overflow: {
    x: number;
    y1: number;
    y2: number;
  } | null;
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

  /** The suggestion blocks being displayed while dragging (if any). */
  private _suggestionBlocks: SuggestionVisualBlock[];

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
    this._suggestionBlocks = [];
  }

  /**
   * Called whenever the timetable/choices changes.
   * @param timetable The updated timetable.
   */
  onTimetableUpdate(timetable: TimetableChoices) {
    // Clear all blocks except the primary blocks.
    this._overflowBlocks.splice(0, this._overflowBlocks.length);
    this._draggingBlock = null;
    this._suggestionBlocks = [];

    // For each choice (a.k.a. each timetable class, since there's guaranteed to
    // be exactly one for each)...
    timetable.choices.forEach((c) => {
      // Todo: skip doing everything below if the choice hasn't changed.

      // Get the class and an array of blocks required.
      const timetableClass = c.timetableClass;
      const timetableBlocks = c.option == null ? [] : c.option.blocks;

      // For each block, work out which visual blocks need to be created.
      const newCoordinates: VisualBlockMapping[] = timetableBlocks.map((b) =>
        this._determineVisualBlockMapping(b)
      );

      // Animate/create/destroy the primary blocks for these new coordinates.
      this._animatePrimaryBlocks(timetableClass, newCoordinates);

      // Create overflow blocks from coordinates. Todo: animate in/out.
      newCoordinates.forEach((b) => {
        if (b.overflow != null) {
          this._overflowBlocks.push(
            new OverflowVisualBlock(
              this._canvas,
              this._gridlines,
              timetableClass,
              b.block,
              b.overflow.x,
              b.overflow.y1,
              b.overflow.y2
            )
          );
        }
      });
    });

    // Remove any primary blocks for classes which no longer exist.
    const toDelete = this._primaryBlocks.filter(
      (b) =>
        timetable.timetable.classes.find((c) => c.equals(b.timetableClass)) ==
        null
    );
    toDelete.forEach((d) =>
      this._primaryBlocks.splice(this._primaryBlocks.indexOf(d), 1)
    );
  }

  /**
   * Animates the existing blocks for a particular class to new coordinates.
   * Creates and destroys blocks if needed so the right amount are shown.
   * @param timetableClass The class to create blocks for.
   * @param newCoordinates The new coordinates to animate the blocks to.
   */
  private _animatePrimaryBlocks(
    timetableClass: TimetableClass,
    newCoordinates: VisualBlockMapping[]
  ) {
    // Find the blocks already being shown for this class.
    const existingBlocks = this._primaryBlocks.filter((b) =>
      b.timetableClass.equals(timetableClass)
    );

    // For each existing block...
    existingBlocks.forEach((b, i) => {
      if (newCoordinates.length > i) {
        // If there are enough new coordinates that this block can be
        // repurposed, then animate it to a new location.
        const coordinates = newCoordinates[i];
        b.animateTo(
          coordinates.block,
          coordinates.main.x,
          coordinates.main.y1,
          coordinates.main.y2
        );
      } else {
        // If by the time this block is reached in the loop all the new
        // coordinates have blocks assigned, then this block is extra, so delete
        // it. Todo: animate it out!
        this._primaryBlocks.splice(this._primaryBlocks.indexOf(b), 1);
      }
    });

    // If there are more new coordinates than existing blocks, then we'll need
    // to create some new blocks.
    if (newCoordinates.length > existingBlocks.length) {
      newCoordinates.slice(existingBlocks.length).forEach((b) => {
        // Todo: animate in the new block.
        this._primaryBlocks.push(
          new PrimaryVisualBlock(
            this._canvas,
            this._gridlines,
            timetableClass,
            b.block,
            b.main.x,
            b.main.y1,
            b.main.y2
          )
        );
      });
    }
  }

  /**
   * Determines where visual blocks should be shown on the canvas for a given
   * timetable block.
   * @param b The timetable block.
   */
  private _determineVisualBlockMapping(b: TimetableBlock): VisualBlockMapping {
    const start = this._gridlines.timeLocation(b.dayOfWeek, b.startTime);
    const end = this._gridlines.timeLocation(b.dayOfWeek, b.endTime);

    // Should never happen.
    if (start == null || end == null) {
      throw new Error();
    }

    // If the start and end columns are different, then an overflow block
    // will be required. Work out where the end of the first block should
    // go.
    const firstBlockEnd =
      start.x === end.x
        ? end.y
        : this._gridlines.endHour - this._gridlines.startHour;

    // Work out where the overflow block should go (if appropriate).
    let overflow = null;
    if (start.x !== end.x) {
      overflow = { x: end.x, y1: 0, y2: end.y };
    }

    return {
      block: b,
      main: { x: start.x, y1: start.y, y2: firstBlockEnd },
      overflow: overflow,
    };
  }

  /**
   * Draws the timetable to the canvas.
   * @param ctx The canvas context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    // Render the blocks in reverse order (so earlier blocks - which are first
    // to be dragged - appear on top).
    for (let i = this._primaryBlocks.length - 1; i >= 0; i--) {
      const block = this._primaryBlocks[i];

      // We'll render the dragging block later (so it's on top).
      if (block !== this._draggingBlock) {
        block.draw(ctx);
      }
    }

    this._overflowBlocks.forEach((b) => b.draw(ctx));

    this._suggestionBlocks.forEach((b) => b.draw(ctx));
    this._draggingBlock?.draw(ctx);
  }

  /**
   * Called when the mouse/touch is pressed on the canvas.
   * @param e The event details.
   */
  onPointerDown(e: MouseEvent) {
    // Multi-touch devices allow a pointerdown to occur without a pointerup
    // beforehand, so ditch the old block if that occurs.
    if (this._draggingBlock != null) {
      this._draggingBlock.cancelDrag();
    }

    // Find the first block that the pointer is within (if any).
    const x = e.offsetX;
    const y = e.offsetY;
    this._draggingBlock =
      this._primaryBlocks.find((b) => b.isWithin(x, y)) ?? null;

    if (this._draggingBlock != null) {
      // Move the block to be in the center of the pointer.
      this._draggingBlock.dragTo(x, y);

      // Build the suggestion blocks for this class.
      this._suggestionBlocks = [];
      const timetableClass = this._draggingBlock.timetableClass;

      // Only show labels on the suggestion blocks if there are options with
      // multiple blocks.
      const showLabels = timetableClass.options.some(
        (o) => o.blocks.length > 1
      );

      timetableClass.options.forEach((o, i) => {
        this._suggestionBlocks.push(
          ...o.blocks.map((b) => {
            // Create a suggestion block in the place of where the primary visual
            // block would be (don't create one for the overflow).
            const mapping = this._determineVisualBlockMapping(b);
            const label = showLabels ? (i + 1).toFixed() : null;
            return new SuggestionVisualBlock(
              this._canvas,
              this._gridlines,
              timetableClass,
              o,
              b,
              mapping.main.x,
              mapping.main.y1,
              mapping.main.y2,
              label
            );
          })
        );
      });
    } else {
      this._suggestionBlocks = [];
    }

    // Suggestion blocks may have changed.
    this._canvas.markDirty();
  }

  /**
   * Called when the mouse/touch is released on the canvas.
   * @param e The event details.
   */
  onPointerUp(e: MouseEvent) {
    if (this._draggingBlock != null) {
      // Work out if the drag ends on top of a suggestion block.
      const x = e.offsetX;
      const y = e.offsetY;
      const newPosition = this._suggestionBlocks.find((b) => b.isWithin(x, y));

      if (newPosition != null) {
        // If so, make this option the suggestion represent the new choice for
        // this class.
        updateTimetable(
          getCurrentTimetable().withChoice(
            this._draggingBlock.timetableClass,
            newPosition.option
          )
        );
      } else {
        // Otherwise return the dragged block back to it's former position.
        this._draggingBlock.cancelDrag();
      }
    }

    this._draggingBlock = null;
    this._suggestionBlocks = [];
  }

  /**
   * Called when the mouse/touch moves on the canvas.
   * @param e The event details.
   */
  onPointerMove(e: MouseEvent) {
    if (this._draggingBlock != null) {
      // Move the block we're dragging to the new pointer location.
      const x = e.offsetX;
      const y = e.offsetY;
      this._draggingBlock.dragTo(x, y);

      // Highlight the suggestion block that we're hovering over (if any), and
      // any others that represent the same option (would have the same label).
      const hovered = this._suggestionBlocks.find((b) =>
        b.isWithin(x, y)
      )?.option;
      this._suggestionBlocks.forEach((b) =>
        b.setHighlighted(hovered != null && b.option.equals(hovered))
      );
    }
  }
}
