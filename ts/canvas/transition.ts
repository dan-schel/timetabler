import { map } from "schel-d-utils";
import { LerpAnimation } from "./animation";
import { CanvasController } from "./canvas-controller";

/**
 * A function transforming a value between 0 and 1, to another value. Used for
 * smoothing animations.
 */
export type EasingFunction = (val: number) => number;

/** Handles creating animations for that values periodically change. */
export class Transition {
  /** A reference to the canvas (for starting/cancelling animations). */
  private readonly _canvas: CanvasController;

  /** The final value once the animation is complete. */
  target: number;

  /** The duration of each created animation. */
  readonly duration: number;

  /** The current or most recent animation. Note: Can be non-null, but done. */
  private _animation: LerpAnimation | null;

  /** The start value to animate from. */
  private _from: number;

  /** The easing function to apply to the animation value. */
  private readonly _easing: EasingFunction;

  /**
   * Creates a {@link Transition}.
   * @param canvas A reference to the canvas (for starting/cancelling
   * animations).
   * @param startValue The initial value.
   * @param duration The duration of each created animation.
   * @param easing The easing function to apply to the animation value. Uses
   * a linear easing function if not provided.
   */
  constructor(canvas: CanvasController, startValue: number, duration: number,
    easing?: EasingFunction) {

    this._canvas = canvas;
    this.target = startValue;
    this.duration = duration;
    this._animation = null;
    this._from = 0;
    this._easing = easing ?? linear;
  }

  /**
   * Gradually changes the value to animate towards the given new target value.
   * @param value The new target value.
   * @param ignoreIfSameTarget Whether to ignore this call instead of restarting
   * the animation if the target value given is identical to the current one.
   * True by default (will not restart animation).
   */
  animateTo(value: number, ignoreIfSameTarget?: boolean) {
    if (this.target == value && ignoreIfSameTarget != false) { return; }

    this._from = this.value();

    if (this._animation != null && !this._animation.isDone()) {
      this._canvas.cancelAnimation(this._animation);
    }

    this.target = value;
    this._animation = new LerpAnimation(this.duration, 0);
    this._canvas.startAnimation(this._animation);
  }

  /**
   * Cancels any running animation and sets the value to the given one
   * immediately (without animating it).
   * @param value The new value.
   */
  jumpTo(value: number) {
    if (this._animation != null && !this._animation.isDone()) {
      this._canvas.cancelAnimation(this._animation);
    }

    this._animation = null;
    this.target = value;
  }

  /** Returns the animating/animated value. */
  value(): number {
    if (this._animation == null || this._animation.isDone()) {
      return this.target;
    }

    const value = this._easing(this._animation.value());
    return map(value, 0, 1, this._from, this.target);
  }
}

/** Linear (a.k.a. no easing) easing function. */
export const linear: EasingFunction = (x: number) =>
  x;

/** Ease-out cubic easing function (https://easings.net/#easeOutCubic). */
export const cubicOut: EasingFunction = (x: number) =>
  1 - Math.pow(1 - x, 3);
