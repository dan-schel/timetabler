/** Manages the currently opened dropdown, closing it when appropriate. */
export class DropdownCoordinator {
  /** The currently open dropdown and associated data. */
  private _current: {
    $dropdown: HTMLDivElement;
    $container: HTMLDivElement | null;
    onClosedCallback: (() => void) | null;
  } | null;

  /**
   * Creates a {@link DropdownCoordinator}.
   */
  constructor() {
    this._current = null;

    // If the dropdown is open and something outside the dropdown is clicked
    // then prevent that action and instead close the dropdown.
    document.addEventListener("click", (e) => {
      const clickedElement = e.target as HTMLElement;

      if (this._current == null) {
        return;
      }

      const highestElement =
        this._current.$container ?? this._current.$dropdown;
      if (!highestElement.contains(clickedElement)) {
        this.close();
        e.preventDefault();
      }
    });

    // If the escape key is pressed close any open dropdowns.
    document.addEventListener("keydown", (e) => {
      if (this._current == null) {
        return;
      }

      if (e.code === "Escape") {
        this.close();
        e.preventDefault();
      }
    });
  }

  /** Returns true if any dropdown is open. */
  get isAnyOpen() {
    return this._current == null;
  }

  /**
   * Returns true if the given dropdown is open.
   * @param div The dropdown to check.
   */
  isOpen(div: HTMLDivElement) {
    return this._current?.$dropdown === div;
  }

  /**
   * Opens a dropdown. Closes the currently open dropdown (if any).
   * @param dropdown The dropdown to open.
   * @param container The container with the dropdown and button (if applicable).
   * @param onClosedCallback A function called when this dropdown is closed.
   */
  open(
    dropdown: HTMLDivElement,
    container?: HTMLDivElement,
    onClosedCallback?: () => void
  ) {
    this.close();

    this._current = {
      $dropdown: dropdown,
      $container: container ?? null,
      onClosedCallback: onClosedCallback ?? null,
    };
    this._current.$dropdown.classList.add("open");
  }

  /**
   * Opens a dropdown, unless it is already open, in which case it closes the
   * dropdown. Closes any other currently open dropdown.
   * @param dropdown The dropdown to open.
   * @param container The container with the dropdown and button (if applicable).
   * @param onClosedCallback A function called when this dropdown is closed.
   */
  toggle(dropdown: HTMLDivElement, container: HTMLDivElement) {
    if (this.isOpen(dropdown)) {
      this.close();
    } else {
      this.open(dropdown, container);
    }
  }

  /** Closes the currently open dropdown (if any). */
  close() {
    if (this._current == null) {
      return;
    }

    this._current.$dropdown.classList.remove("open");
    if (this._current.onClosedCallback != null) {
      this._current.onClosedCallback();
    }
    this._current = null;
  }
}
