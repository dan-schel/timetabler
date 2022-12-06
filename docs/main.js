"use strict";
(() => {
  // node_modules/schel-d-utils-browser/dist/finder.js
  var finder = {
    any,
    div,
    anchor,
    input,
    button,
    select,
    canvas
  };
  function any(id) {
    const result = document.getElementById(id);
    if (result != null) {
      return result;
    }
    throw new Error(`Element with id "#${id}" not found.`);
  }
  function elementOfType(id, typeName, typeChecker) {
    const result = any(id);
    if (typeChecker(result)) {
      return result;
    }
    throw new Error(`Element with id "#${id}" is not a "${typeName}".`);
  }
  function div(id) {
    return elementOfType(id, "HTMLDivElement", (x) => x instanceof HTMLDivElement);
  }
  function anchor(id) {
    return elementOfType(id, "HTMLAnchorElement", (x) => x instanceof HTMLAnchorElement);
  }
  function input(id) {
    return elementOfType(id, "HTMLInputElement", (x) => x instanceof HTMLInputElement);
  }
  function button(id) {
    return elementOfType(id, "HTMLButtonElement", (x) => x instanceof HTMLButtonElement);
  }
  function select(id) {
    return elementOfType(id, "HTMLSelectElement", (x) => x instanceof HTMLSelectElement);
  }
  function canvas(id) {
    return elementOfType(id, "HTMLCanvasElement", (x) => x instanceof HTMLCanvasElement);
  }

  // ts/main.ts
  var html = {
    controls: finder.any("controls"),
    canvasContainer: finder.div("canvas-container"),
    canvas: finder.canvas("canvas"),
    mobileExpanderButton: finder.button("mobile-expander-button")
  };
  var css = (() => {
    const style = getComputedStyle(html.canvas);
    return {
      colorInk80: style.getPropertyValue("--color-ink-80")
    };
  })();
  var ctx = (() => {
    const maybe = html.canvas.getContext("2d");
    if (maybe == null) {
      throw new Error("Cannot get canvas context");
    }
    return maybe;
  })();
  var width = 0;
  var height = 0;
  var dpiRatio = 1;
  fitCanvas();
  window.addEventListener("resize", () => fitCanvas());
  html.mobileExpanderButton.addEventListener("click", () => {
    html.controls.classList.toggle("collapsed");
  });
  function fitCanvas() {
    const containerSize = html.canvasContainer.getBoundingClientRect();
    width = containerSize.width;
    height = containerSize.height;
    const ctx2 = html.canvas.getContext("2d");
    if (ctx2 == null) {
      throw new Error("Cannot get canvas context");
    }
    dpiRatio = calculateDpiRatio(ctx2);
    html.canvas.style.width = `${width}px`;
    html.canvas.style.height = `${height}px`;
    html.canvas.width = width * dpiRatio;
    html.canvas.height = height * dpiRatio;
    draw();
  }
  function draw() {
    ctx.save();
    ctx.scale(dpiRatio, dpiRatio);
    ctx.font = "1rem Atkinson Hyperlegible";
    ctx.fillStyle = css.colorInk80;
    ctx.fillText(
      "Word",
      width - 30,
      height - 30
    );
    ctx.restore();
  }
  function calculateDpiRatio(ctx2) {
    var _a, _b;
    const dpr = (_a = window.devicePixelRatio) != null ? _a : 1;
    const bsr = (_b = ctx2.backingStorePixelRatio) != null ? _b : 1;
    return dpr / bsr;
  }
})();
//# sourceMappingURL=main.js.map
