import { div } from "./make/div";

/**
 * Creates a div that houses content that updates with an animation.
 */
export class OdometerController<T> {
  /** The div to add to the layout which houses the odometer. */
  readonly $div: HTMLDivElement;

  /**
   * A function that returns true if two values are equivalent (meaning no UI
   * refresh will be needed).
   */
  private readonly _equals: (a: T, b: T) => boolean;

  /** A function that creates the UI for a given value. */
  private readonly _builder: (value: T) => HTMLElement;

  /** The current value being displayed (transformed by {@link _builder} into UI). */
  private _currentValue: T;

  /** The element containing the UI for the {@link _currentValue}. */
  private _$in: HTMLElement;

  /** The element containing the UI that is animating out (if any). */
  private _$out: HTMLElement | null;

  /**
   * The CSS class that runs the "in" animation. Note that this class isn't
   * always applied, since the initial value's UI won't have it if the "animate
   * start" option is disabled.
   */
  private readonly _childInClass: string;

  /** The CSS class that runs the "out" animation. */
  private readonly _childOutClass: string;

  /**
   * Creates the controller, the div, and builds the UI for the initial state.
   * @param initialValue The value to create a view for upon construction of the
   * odometer.
   * @param equals A function that returns true if two values are equivalent
   * (meaning no UI refresh will be needed).
   * @param builder A function that creates the UI for a given value.
   * @param animateStart Whether or not to run the animation for the initial
   * value.
   * @param parentDivClass The CSS class applied to the main div containing the
   * odometer.
   * @param childInClass The CSS class applied to the element ani
   */
  constructor(initialValue: T, equals: (a: T, b: T) => boolean,
    builder: (value: T) => HTMLElement, animateStart = false,
    parentDivClass = "odometer", childInClass = "odometer-in",
    childOutClass = "odometer-out") {

    this._childInClass = childInClass;
    this._childOutClass = childOutClass;

    this.$div = div({ classes: [parentDivClass] }, {}).$element;

    this._$in = builder(initialValue);
    this._$out = null;

    this._currentValue = initialValue;
    this._equals = equals;
    this._builder = builder;

    this.$div.append(this._$in);
    if (animateStart) {
      this._$in.classList.add(childInClass);
    }
  }

  /**
   * Set the value to be displayed in the odometer. Only updates the UI if the
   * value has changed.
   * @param value The new value to display in the UI.
   * @param skipAnimation Whether to skip the animation. False by default.
   */
  update(value: T, skipAnimation = false) {
    if (this._equals(this.currentValue, value)) { return; }

    this._$out?.remove();
    if (!skipAnimation) {
      this._$out = this._$in;
      this._$out.classList.remove(this._childInClass);
      this._$out.classList.add(this._childOutClass);

      // Tell screenreaders to ignore the outdated UI.
      this._$out.ariaHidden = "true";
    }
    else {
      this._$in.remove();
      this._$out = null;
    }

    this._$in = this._builder(value);
    if (!skipAnimation) {
      this._$in.classList.add(this._childInClass);
    }
    this.$div.append(this._$in);

    this._currentValue = value;
  }

  /**
   * The value the odometer is currently displaying in the UI.
   */
  get currentValue(): T {
    return this._currentValue;
  }
}
