/**
 * Draws a line to the canvas.
 * @param ctx The canvas context.
 * @param x1 The line's starting x-coordinate.
 * @param y1 The line's starting y-coordinate.
 * @param x2 The line's ending x-coordinate.
 * @param y2 The line's ending y-coordinate.
 * @param strokeStyle The stroke style (color) of the line.
 * @param lineWidth The thinkness of the line.
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeStyle: string,
  lineWidth: number
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/**
 * Draws a rounded rectangle to the canvas.
 * @param ctx The canvas context.
 * @param x1 The x-coordinate of the top-left corner.
 * @param y1 The y-coordinate of the top-left corner.
 * @param x2 The x-coordinate of the bottom-right corner.
 * @param y2 The y-coordinate of the bottom-right corner.
 * @param radius The radius of each corner.
 * @param fillStyle The fill style (color) of the rectangle.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  fillStyle: string
) {
  ctx.fillStyle = fillStyle;
  roundedRectPath(ctx, x1, y1, x2, y2, radius);
  ctx.fill();
}

/**
 * Draws an outlined rounded rectangle to the canvas.
 * @param ctx The canvas context.
 * @param x1 The x-coordinate of the top-left corner.
 * @param y1 The y-coordinate of the top-left corner.
 * @param x2 The x-coordinate of the bottom-right corner.
 * @param y2 The y-coordinate of the bottom-right corner.
 * @param radius The radius of each corner.
 * @param strokeStyle The stroke style (color) of the rectangle.
 */
export function drawOutlinedRoundedRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  strokeStyle: string
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 4;

  roundedRectPath(ctx, x1 + 2, y1 + 2, x2 - 2, y2 - 2, radius);
  ctx.stroke();
}

/**
 * Draws a rounded rectangle to the canvas filled with a gradient.
 * @param ctx The canvas context.
 * @param x1 The x-coordinate of the top-left corner.
 * @param y1 The y-coordinate of the top-left corner.
 * @param x2 The x-coordinate of the bottom-right corner.
 * @param y2 The y-coordinate of the bottom-right corner.
 * @param radius The radius of each corner.
 * @param color1 The first color in the gradient.
 * @param color2 The second color in the gradient.
 */
export function drawGradientRoundedRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  color1: string,
  color2: string
) {
  ctx.fillStyle = rectGradient(ctx, x1, y1, x2, y2, color1, color2, 2);

  roundedRectPath(ctx, x1, y1, x2, y2, radius);
  ctx.fill();
}

/**
 * Draws a rounded rectangle to the canvas outlined with a gradient and filled
 * with color.
 * @param ctx The canvas context.
 * @param x1 The x-coordinate of the top-left corner.
 * @param y1 The y-coordinate of the top-left corner.
 * @param x2 The x-coordinate of the bottom-right corner.
 * @param y2 The y-coordinate of the bottom-right corner.
 * @param radius The radius of each corner.
 * @param color1 The first color in the gradient.
 * @param color2 The second color in the gradient.
 * @param fillStyle The fill style (color) of the rectangle.
 */
export function drawOutlinedGradientRoundedRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  color1: string,
  color2: string,
  fillStyle: string
) {
  ctx.strokeStyle = rectGradient(ctx, x1, y1, x2, y2, color1, color2, 1);
  ctx.lineWidth = 4;
  ctx.fillStyle = fillStyle;

  roundedRectPath(ctx, x1 + 2, y1 + 2, x2 - 2, y2 - 2, radius);
  ctx.fill();
  ctx.stroke();
}

/**
 * Creates the path for a rounded rectangle.
 * @param ctx The canvas context.
 * @param x1 The x-coordinate of the top-left corner.
 * @param y1 The y-coordinate of the top-left corner.
 * @param x2 The x-coordinate of the bottom-right corner.
 * @param y2 The y-coordinate of the bottom-right corner.
 * @param radius The radius of each corner.
 */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x1 + radius, y1);
  ctx.lineTo(x2 - radius, y1);
  ctx.quadraticCurveTo(x2, y1, x2, y1 + radius);
  ctx.lineTo(x2, y2 - radius);
  ctx.quadraticCurveTo(x2, y2, x2 - radius, y2);
  ctx.lineTo(x1 + radius, y2);
  ctx.quadraticCurveTo(x1, y2, x1, y2 - radius);
  ctx.lineTo(x1, y1 + radius);
  ctx.quadraticCurveTo(x1, y1, x1 + radius, y1);
  ctx.closePath();
}

function rectGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string,
  spread: number
) {
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const size = Math.max(x2 - x1, y2 - y1);

  const gradient = ctx.createLinearGradient(
    centerX - size * 0.5 * spread,
    centerY - size * 0.5 * spread,
    centerX + size * 0.5 * spread,
    centerY + size * 0.5 * spread
  );
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

/**
 * Draws an icon to the canvas.
 * @param ctx The canvas context.
 * @param icon The icon.
 * @param x The x-coordinate of the top-left corner.
 * @param y The y-coordinate of the top-left corner.
 * @param scale The size to scale the icon (in addition to the viewbox size).
 * @param fillStyle The fill style (color) of the icon.
 */
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: Path2D,
  x: number,
  y: number,
  scale: number,
  fillStyle: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = fillStyle;
  ctx.fill(icon);
  ctx.restore();
}

/**
 * Draws text to the canvas.
 * @param ctx The canvas context.
 * @param text The text.
 * @param x The x-coordinate of the top-left corner.
 * @param y The y-coordinate of the top-left corner.
 * @param fontSizeRem The font size (measured in rem) of the text.
 * @param fontStyle The font style (bold/italic).
 * @param fillStyle The fill style (color) of the text.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSizeRem: number,
  fontStyle: "bold" | null,
  fillStyle: string
) {
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.font = createFontString(fontSizeRem, fontStyle);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
}

/**
 * Returns the width of the given text in pixels.
 * @param ctx The canvas context.
 * @param text The text.
 * @param fontSizeRem The font size (measured in rem) of the text.
 * @param fontStyle The font style (bold/italic).
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSizeRem: number,
  fontStyle: "bold" | null
): number {
  ctx.font = createFontString(fontSizeRem, fontStyle);
  return ctx.measureText(text).width;
}

/**
 * Creates a font string for the canvas, e.g. "bold 1rem Atkinson Hyperlegible".
 * @param fontSizeRem The font size (measured in rem) of the text.
 * @param fontStyle The font style (bold/italic).
 */
function createFontString(
  fontSizeRem: number,
  fontStyle: "bold" | null
): string {
  return [fontStyle, `${fontSizeRem}rem`, "Atkinson Hyperlegible"]
    .filter((x) => x != null)
    .join(" ");
}

/**
 * Converts rem to pixels (multiply by 16).
 * @param rem Measurement in pixels.
 */
export function rem(rem: number): number {
  return rem * 16;
}
