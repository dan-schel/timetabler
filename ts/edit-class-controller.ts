import { Html } from "./main";

/** Manages the edit class menu. */
export class EditClassController {
  /** References to the HTML elements on the page. */
  private readonly _html: Html;

  /**
   * Creates a {@link EditClassController}.
   * @param html References to the HTML elements on the page.
   */
  constructor(html: Html) {
    this._html = html;

    this.attachEvents();
  }

  /** Sets up event handlers. */
  attachEvents() {
    this._html.editClassBackButton.addEventListener("click", () => {
      this.close();
    });
  }

  /** Opens the menu. */
  open() {
    this._html.controls.classList.add("edit-class");
  }

  /** Closes the menu. */
  close() {
    this._html.controls.classList.remove("edit-class");
  }
}
