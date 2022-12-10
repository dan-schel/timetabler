import { CanvasController } from "./canvas-controller";

/** Handles rendering the timetable gridlines to the canvas. */
export class GridlinesRenderer {
  /** The canvas to draw to. */
  private readonly _canvas: CanvasController;

  /**
   * Creates a {@link GridlinesRenderer}.
   * @param canvas The canvas to draw to.
   */
  constructor(canvas: CanvasController) {
    this._canvas = canvas;
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
    const x1 = 16 * 3;
    const x2 = this._canvas.width - 16 * 0.5;
    const colWidth = (x2 - x1) / 7;
    const y1 = 16 * 0.5;
    const y2 = this._canvas.height - 16 * (1 + 1.2 + 0.3 + 1);
    const colHeaderHeight = 16 * 2;

    // Draw the line under the column names.
    ctx.strokeStyle = `${this._canvas.css.colorInk30}`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, colHeaderHeight + y1);
    ctx.lineTo(x2, colHeaderHeight + y1);
    ctx.stroke();

    // Draw the vertical lines between columns.
    for (let i = 1; i < 7; i++) {
      ctx.strokeStyle = `${this._canvas.css.colorInk10}`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + colWidth * i, y1);
      ctx.lineTo(x1 + colWidth * i, y2);
      ctx.stroke();
    }

    // Draw the day of week labels.
    ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].forEach((d, i) => {
      const text = colWidth > 16 * 4 ? d : d[0];
      ctx.font = "bold 0.75rem Atkinson Hyperlegible";
      ctx.fillStyle = this._canvas.css.colorInk80;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(
        text,
        x1 + colWidth * i + (colWidth - textWidth) / 2,
        y1 + colHeaderHeight / 2 + 2
      );
    });

    const times = [
      "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
      "6pm", "7pm", "8pm"
    ];
    const rowHeight = (y2 - y1 - colHeaderHeight) / (times.length - 1);

    times.forEach((t, i) => {
      // Draw the time labels.
      const text = t;
      ctx.font = "0.75rem Atkinson Hyperlegible";
      ctx.fillStyle = this._canvas.css.colorInk80;
      ctx.fillText(
        text,
        16 * 0.5,
        y1 + colHeaderHeight + rowHeight * i + 3
      );

      // Draw the horizontal lines for each hour.
      if (i != 0) {
        ctx.strokeStyle = `${this._canvas.css.colorInk10}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + colHeaderHeight + rowHeight * i);
        ctx.lineTo(x2, y1 + colHeaderHeight + rowHeight * i);
        ctx.stroke();
      }
    });
  }

  /**
   * Draws the "Drag time blocks to switch options" message.
   * @param ctx The canvas context.
   */
  private _drawDragPrompt(ctx: CanvasRenderingContext2D) {
    const iconSize = 1.2 * 16;
    const bottomMargin = 1 * 16;
    const gap = 0.5 * 16;

    const text = "Drag time blocks to switch options";

    // Diagonal arrows icon.
    const icon = new Path2D(
      "M21.92 2.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L4 " +
      "18.59V15a1 1 0 0 0-2 0v6a1 1 0 0 0 .08.38a1 1 0 0 0 .54.54A1 1 0 0 0 " +
      "3 22h6a1 1 0 0 0 0-2H5.41L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38Z"
    );

    // Draw the "Drag time blocks to switch options" text.
    ctx.font = "1rem Atkinson Hyperlegible";
    ctx.fillStyle = this._canvas.css.colorInk80;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(
      text,
      (this._canvas.width - (textWidth + iconSize + gap)) / 2 + iconSize + gap,
      this._canvas.height - bottomMargin - (16 * 0.2)
    );

    // Draw the diagonal arrows icon.
    ctx.save();
    ctx.translate(
      (this._canvas.width - (textWidth + iconSize + gap)) / 2,
      this._canvas.height - bottomMargin - (16 * 1.2)
    );
    ctx.scale(iconSize / 24, iconSize / 24);
    ctx.fillStyle = this._canvas.css.colorInk80;
    ctx.fill(icon);
    ctx.restore();
  }
}
