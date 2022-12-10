import { mapClamp } from "schel-d-utils";

/** An animation running on the canvas. */
export abstract class Animation {
  /** True if the animation is finished. */
  abstract isDone(): boolean;

  /**
   * Indicates that time has passed so the animation's value should be updated.
   * @param delta The number of seconds elasped since the last update.
   */
  abstract run(delta: number): void;
}

/** Animates a value linearly forward between 0 and 1 for a given duration. */
export class LerpAnimation extends Animation {
  /** The duration (in seconds) the animation runs (not including the delay). */
  readonly duration: number;

  /** How long to wait before the animation starts. */
  readonly delay: number;

  /**
   * How long the animation has been running already. Used to calculate the
   * value.
   */
  private _elapsed: number;

  /**
   * Creates a {@link LerpAnimation}.
   * @param duration The duration (in seconds) the animation runs (not including
   * the delay).
   * @param delay How long to wait before the animation starts.
   */
  constructor(duration: number, delay: number) {
    super();
    this.duration = duration;
    this.delay = delay;
    this._elapsed = 0;
  }

  /** Returns a animating value (which is always between 0 and 1). */
  value(): number {
    return mapClamp(this._elapsed, this.delay, this.duration + this.delay, 0, 1);
  }

  // JSDoc inherited.
  isDone(): boolean {
    return this._elapsed >= this.duration + this.delay;
  }

  // JSDoc inherited.
  run(delta: number): void {
    this._elapsed += delta;
  }
}
