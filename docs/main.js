"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b ||= {})
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // node_modules/schel-d-utils-browser/dist/download-upload.js
  function download(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor2 = document.createElement("a");
    anchor2.href = url;
    anchor2.download = filename;
    document.body.appendChild(anchor2);
    anchor2.click();
    document.body.removeChild(anchor2);
    URL.revokeObjectURL(url);
  }
  function openFileDialog(extension, callback) {
    const input2 = document.createElement("input");
    input2.type = "file";
    input2.accept = extension;
    input2.click();
    input2.addEventListener("change", async () => {
      const files = input2.files;
      if (files != null && files[0] != null) {
        callback(await files[0].text());
      }
    });
  }

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

  // node_modules/schel-d-utils/dist/esm/arrays.js
  function unique(array, equalsFunc) {
    if (equalsFunc == null) {
      return [...new Set(array)];
    }
    const result = [];
    for (const item of array) {
      if (result.some((i) => equalsFunc(i, item))) {
        continue;
      }
      result.push(item);
    }
    return result;
  }
  function areUnique(array, equalsFunc) {
    return array.length == unique(array, equalsFunc).length;
  }
  function arraysMatch(a, b, equalsFunc) {
    if (a.length == 0 && b.length == 0) {
      return true;
    }
    if (a.length == 0 || b.length == 0) {
      return false;
    }
    const comparer = equalsFunc == null ? (a2, b2) => a2 == b2 : equalsFunc;
    return a.every((c) => b.some((d) => comparer(c, d))) && b.every((d) => a.some((c) => comparer(c, d)));
  }

  // node_modules/schel-d-utils/dist/esm/clamp.js
  function clamp(x, a, b) {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return Math.min(Math.max(x, min), max);
  }
  function map(x, inA, inB, outA, outB) {
    return (x - inA) / (inB - inA) * (outB - outA) + outA;
  }
  function mapClamp(x, inA, inB, outA, outB) {
    return clamp(map(x, inA, inB, outA, outB), outA, outB);
  }

  // node_modules/schel-d-utils/dist/esm/integers.js
  function parseIntNull(value) {
    if (!/^-?[0-9]+$/g.test(value)) {
      return null;
    }
    const num = parseInt(value, 10);
    return num;
  }
  function posMod(x, mod2) {
    if (x >= 0) {
      return x % mod2;
    } else {
      return (x + Math.floor(x) * -mod2) % mod2;
    }
  }

  // ts/canvas/animation.ts
  var Animation = class {
  };
  var LerpAnimation = class extends Animation {
    constructor(duration, delay) {
      super();
      this.duration = duration;
      this.delay = delay;
      this._elapsed = 0;
    }
    value() {
      return mapClamp(this._elapsed, this.delay, this.duration + this.delay, 0, 1);
    }
    isDone() {
      return this._elapsed >= this.duration + this.delay;
    }
    run(delta) {
      this._elapsed += delta;
    }
  };

  // ts/canvas/transition.ts
  var Transition = class {
    constructor(canvas3, startValue, duration, easing) {
      this._canvas = canvas3;
      this.target = startValue;
      this.duration = duration;
      this._animation = null;
      this._from = 0;
      this._easing = easing != null ? easing : linear;
    }
    animateTo(value, ignoreIfSameTarget) {
      if (this.target == value && ignoreIfSameTarget != false) {
        return;
      }
      this._from = this.value();
      if (this._animation != null && !this._animation.isDone()) {
        this._canvas.cancelAnimation(this._animation);
      }
      this.target = value;
      this._animation = new LerpAnimation(this.duration, 0);
      this._canvas.startAnimation(this._animation);
    }
    jumpTo(value) {
      if (this._animation != null && !this._animation.isDone()) {
        this._canvas.cancelAnimation(this._animation);
      }
      this._animation = null;
      this.target = value;
    }
    value() {
      if (this._animation == null || this._animation.isDone()) {
        return this.target;
      }
      const value = this._easing(this._animation.value());
      return map(value, 0, 1, this._from, this.target);
    }
  };
  var linear = (x) => x;
  var cubicOut = (x) => 1 - Math.pow(1 - x, 3);

  // ts/canvas/utils.ts
  function drawLine(ctx, x1, y1, x2, y2, strokeStyle, lineWidth) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function drawRoundedRect(ctx, x1, y1, x2, y2, radius, fillStyle) {
    ctx.fillStyle = fillStyle;
    roundedRectPath(ctx, x1, y1, x2, y2, radius);
    ctx.fill();
  }
  function drawGradientRoundedRect(ctx, x1, y1, x2, y2, radius, color1, color2) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    roundedRectPath(ctx, x1, y1, x2, y2, radius);
    ctx.fill();
  }
  function roundedRectPath(ctx, x1, y1, x2, y2, radius) {
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
  function drawIcon(ctx, icon, x, y, scale, fillStyle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = fillStyle;
    ctx.fill(icon);
    ctx.restore();
  }
  function drawText(ctx, text, x, y, fontSizeRem, fontStyle, fillStyle) {
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = createFontString(fontSizeRem, fontStyle);
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
  }
  function measureText(ctx, text, fontSizeRem, fontStyle) {
    ctx.font = createFontString(fontSizeRem, fontStyle);
    return ctx.measureText(text).width;
  }
  function createFontString(fontSizeRem, fontStyle) {
    return [fontStyle, `${fontSizeRem}rem`, "Atkinson Hyperlegible"].filter((x) => x != null).join(" ");
  }
  function rem(rem2) {
    return rem2 * 16;
  }

  // ts/canvas/visual-block.ts
  var blockTransitionDuration = 0.2;
  var blockTransitionEasing = cubicOut;
  var VisualBlock = class {
    constructor(canvas3, gridlines, timetableClass, initialBlock) {
      this._canvas = canvas3;
      this._gridlines = gridlines;
      this.timetableClass = timetableClass;
      this.timetableBlock = initialBlock;
    }
    dimensions(x, y1, y2) {
      const {
        x1: gridX1,
        y1: gridY1,
        dayWidth,
        hourHeight
      } = this._gridlines.gridDimensions();
      return {
        blockX1: gridX1 + dayWidth * x,
        blockY1: gridY1 + hourHeight * y1,
        blockX2: gridX1 + dayWidth * (x + 1),
        blockY2: gridY1 + hourHeight * y2
      };
    }
  };
  var PrimaryVisualBlock = class extends VisualBlock {
    constructor(canvas3, gridlines, timetableClass, initialBlock, initialX, initialY1, initialY2) {
      super(canvas3, gridlines, timetableClass, initialBlock);
      this.xTransition = new Transition(
        this._canvas,
        initialX,
        blockTransitionDuration,
        blockTransitionEasing
      );
      this.y1Transition = new Transition(
        this._canvas,
        initialY1,
        blockTransitionDuration,
        blockTransitionEasing
      );
      this.y2Transition = new Transition(
        this._canvas,
        initialY2,
        blockTransitionDuration,
        blockTransitionEasing
      );
      this._dragCoords = null;
    }
    animateTo(newBlock, newX, newY1, newY2) {
      if (this._dragCoords != null) {
        this.xTransition.jumpTo(this._dragCoords.x);
        this.y1Transition.jumpTo(this._dragCoords.y1);
        this.y2Transition.jumpTo(this._dragCoords.y2);
        this._dragCoords = null;
      }
      this.timetableBlock = newBlock;
      this.xTransition.animateTo(newX);
      this.y1Transition.animateTo(newY1);
      this.y2Transition.animateTo(newY2);
    }
    dragTo(canvasX, canvasY) {
      const {
        x1: gridX1,
        y1: gridY1,
        dayWidth,
        hourHeight
      } = this._gridlines.gridDimensions();
      const duration = this.y2Transition.target - this.y1Transition.target;
      this._dragCoords = {
        x: (canvasX - gridX1) / dayWidth - 0.5,
        y1: (canvasY - gridY1) / hourHeight - duration / 2,
        y2: (canvasY - gridY1) / hourHeight + duration / 2
      };
      this._canvas.markDirty();
    }
    cancelDrag() {
      if (this._dragCoords == null) {
        return;
      }
      const oldX = this.xTransition.target;
      this.xTransition.jumpTo(this._dragCoords.x);
      this.xTransition.animateTo(oldX);
      const oldY1 = this.y1Transition.target;
      this.y1Transition.jumpTo(this._dragCoords.y1);
      this.y1Transition.animateTo(oldY1);
      const oldY2 = this.y2Transition.target;
      this.y2Transition.jumpTo(this._dragCoords.y2);
      this.y2Transition.animateTo(oldY2);
      this._dragCoords = null;
    }
    draw(ctx) {
      var _a, _b, _c, _d, _e, _f;
      const x = (_b = (_a = this._dragCoords) == null ? void 0 : _a.x) != null ? _b : this.xTransition.value();
      const y1 = (_d = (_c = this._dragCoords) == null ? void 0 : _c.y1) != null ? _d : this.y1Transition.value();
      const y2 = (_f = (_e = this._dragCoords) == null ? void 0 : _e.y2) != null ? _f : this.y2Transition.value();
      const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(x, y1, y2);
      const colors = this._canvas.css.classColors[this.timetableClass.color];
      drawGradientRoundedRect(
        ctx,
        blockX1,
        blockY1,
        blockX2,
        blockY2,
        rem(0.5),
        colors.gradient1,
        colors.gradient2
      );
    }
    isWithin(x, y) {
      const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
        this.xTransition.target,
        this.y1Transition.target,
        this.y2Transition.target
      );
      return x >= blockX1 && x <= blockX2 && y >= blockY1 && y <= blockY2;
    }
  };
  var OverflowVisualBlock = class extends VisualBlock {
    constructor(canvas3, gridlines, timetableClass, block, x, y1, y2) {
      super(canvas3, gridlines, timetableClass, block);
      this.x = x;
      this.y1 = y1;
      this.y2 = y2;
    }
    draw(ctx) {
      const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
        this.x,
        this.y1,
        this.y2
      );
      drawRoundedRect(
        ctx,
        blockX1,
        blockY1,
        blockX2,
        blockY2,
        rem(0.5),
        this._canvas.css.colorInk30
      );
    }
  };
  var SuggestionVisualBlock = class extends VisualBlock {
    constructor(canvas3, gridlines, timetableClass, option, block, x, y1, y2, label) {
      super(canvas3, gridlines, timetableClass, block);
      this.option = option;
      this.x = x;
      this.y1 = y1;
      this.y2 = y2;
      this.label = label;
      this._highlighted = false;
    }
    draw(ctx) {
      const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
        this.x,
        this.y1,
        this.y2
      );
      drawRoundedRect(
        ctx,
        blockX1,
        blockY1,
        blockX2,
        blockY2,
        rem(0.5),
        this._highlighted ? this._canvas.css.colorInk30 : this._canvas.css.colorInk10
      );
      if (this.label != null) {
        const textWidth = measureText(ctx, this.label, 2, "bold");
        const textX = blockX1 + (blockX2 - blockX1 - textWidth) / 2;
        const textY = blockY1 + (blockY2 - blockY1 - rem(2)) / 2 + 2;
        drawText(
          ctx,
          this.label,
          textX,
          textY,
          2,
          "bold",
          this._canvas.css.colorInk30
        );
      }
    }
    isWithin(x, y) {
      const { blockX1, blockY1, blockX2, blockY2 } = this.dimensions(
        this.x,
        this.y1,
        this.y2
      );
      return x >= blockX1 && x <= blockX2 && y >= blockY1 && y <= blockY2;
    }
    setHighlighted(highlighted) {
      this._highlighted = highlighted;
      this._canvas.markDirty();
    }
  };

  // ts/canvas/blocks-renderer.ts
  var BlocksRenderer = class {
    constructor(canvas3, gridlines) {
      this._canvas = canvas3;
      this._gridlines = gridlines;
      this._primaryBlocks = [];
      this._overflowBlocks = [];
      this._draggingBlock = null;
      this._suggestionBlocks = [];
    }
    onTimetableUpdate(timetable2) {
      this._overflowBlocks.splice(0, this._overflowBlocks.length);
      timetable2.choices.forEach((c) => {
        const timetableClass = c.timetableClass;
        const timetableBlocks = c.option == null ? [] : c.option.blocks;
        const newCoordinates = timetableBlocks.map((b) => this._determineVisualBlockMapping(b));
        this._animatePrimaryBlocks(timetableClass, newCoordinates);
        newCoordinates.forEach((b) => {
          if (b.overflow != null) {
            this._overflowBlocks.push(new OverflowVisualBlock(
              this._canvas,
              this._gridlines,
              timetableClass,
              b.block,
              b.overflow.x,
              b.overflow.y1,
              b.overflow.y2
            ));
          }
        });
      });
    }
    _animatePrimaryBlocks(timetableClass, newCoordinates) {
      const existingBlocks = this._primaryBlocks.filter((b) => b.timetableClass.equals(timetableClass));
      existingBlocks.forEach((b, i) => {
        if (newCoordinates.length > i) {
          const coordinates = newCoordinates[i];
          b.animateTo(
            coordinates.block,
            coordinates.main.x,
            coordinates.main.y1,
            coordinates.main.y2
          );
        } else {
          this._primaryBlocks.splice(this._primaryBlocks.indexOf(b), 1);
        }
      });
      if (newCoordinates.length > existingBlocks.length) {
        newCoordinates.slice(existingBlocks.length).forEach((b) => {
          this._primaryBlocks.push(new PrimaryVisualBlock(
            this._canvas,
            this._gridlines,
            timetableClass,
            b.block,
            b.main.x,
            b.main.y1,
            b.main.y2
          ));
        });
      }
    }
    _determineVisualBlockMapping(b) {
      const start = this._gridlines.timeLocation(b.dayOfWeek, b.startTime);
      const end = this._gridlines.timeLocation(b.dayOfWeek, b.endTime);
      if (start == null || end == null) {
        throw new Error();
      }
      const firstBlockEnd = start.x == end.x ? end.y : this._gridlines.endHour - this._gridlines.startHour;
      let overflow = null;
      if (start.x != end.x) {
        overflow = {
          x: end.x,
          y1: 0,
          y2: end.y
        };
      }
      return {
        block: b,
        main: { x: start.x, y1: start.y, y2: firstBlockEnd },
        overflow
      };
    }
    draw(ctx) {
      var _a;
      this._primaryBlocks.forEach((b) => {
        if (b != this._draggingBlock) {
          b.draw(ctx);
        }
      });
      this._overflowBlocks.forEach((b) => b.draw(ctx));
      this._suggestionBlocks.forEach((b) => b.draw(ctx));
      (_a = this._draggingBlock) == null ? void 0 : _a.draw(ctx);
    }
    onPointerDown(e) {
      var _a;
      if (this._draggingBlock != null) {
        this._draggingBlock.cancelDrag();
      }
      const x = e.offsetX;
      const y = e.offsetY;
      this._draggingBlock = (_a = this._primaryBlocks.find((b) => b.isWithin(x, y))) != null ? _a : null;
      if (this._draggingBlock != null) {
        this._draggingBlock.dragTo(x, y);
        const timetableClass = this._draggingBlock.timetableClass;
        this._suggestionBlocks = [];
        timetableClass.options.forEach((o, i) => {
          this._suggestionBlocks.push(...o.blocks.map((b) => {
            const mapping = this._determineVisualBlockMapping(b);
            return new SuggestionVisualBlock(
              this._canvas,
              this._gridlines,
              timetableClass,
              o,
              b,
              mapping.main.x,
              mapping.main.y1,
              mapping.main.y2,
              (i + 1).toFixed()
            );
          }));
        });
      } else {
        this._suggestionBlocks = [];
      }
      this._canvas.markDirty();
    }
    onPointerUp(e) {
      if (this._draggingBlock != null) {
        const x = e.offsetX;
        const y = e.offsetY;
        const newPosition = this._suggestionBlocks.find((b) => b.isWithin(x, y));
        if (newPosition != null) {
          updateTimetable(getCurrentTimetable().withChoice(
            this._draggingBlock.timetableClass,
            newPosition.option
          ));
        } else {
          this._draggingBlock.cancelDrag();
        }
      }
      this._draggingBlock = null;
      this._suggestionBlocks = [];
    }
    onPointerMove(e) {
      var _a;
      if (this._draggingBlock != null) {
        const x = e.offsetX;
        const y = e.offsetY;
        this._draggingBlock.dragTo(x, y);
        const hovered = (_a = this._suggestionBlocks.find((b) => b.isWithin(x, y))) == null ? void 0 : _a.option;
        this._suggestionBlocks.forEach(
          (b) => b.setHighlighted(hovered != null && b.option.equals(hovered))
        );
      }
    }
  };

  // ts/time/time-error.ts
  var TimeError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "TimeError";
    }
    static timeOutOfRange(minuteOfDay) {
      return new TimeError(
        `Minute of day "${minuteOfDay}" is out of range for a LocalTime.`
      );
    }
    static badTimeString(value) {
      return new TimeError(
        `String "${value}" cannot be interpreted as a LocalTime.`
      );
    }
    static invalidDaysSinceMonday(value) {
      return new TimeError(
        `"${value}" is not a valid days since Monday number for a day of week.`
      );
    }
  };

  // ts/time/day-of-week.ts
  var DayOfWeekNumbers = [0, 1, 2, 3, 4, 5, 6];
  var _DayOfWeek = class {
    constructor(daysSinceMonday) {
      this.daysSinceMonday = daysSinceMonday;
    }
    get name() {
      return names[this.daysSinceMonday].full;
    }
    get codeName() {
      return names[this.daysSinceMonday].codeName;
    }
    get isWeekend() {
      return this.daysSinceMonday == 5 || this.daysSinceMonday == 6;
    }
    get isWeekday() {
      return !this.isWeekend;
    }
    yesterday() {
      return _DayOfWeek.fromDaysSinceMonday(posMod(this.daysSinceMonday - 1, 7));
    }
    tomorrow() {
      return _DayOfWeek.fromDaysSinceMonday(posMod(this.daysSinceMonday + 1, 7));
    }
    equals(other) {
      return this.daysSinceMonday == other.daysSinceMonday;
    }
    static fromDaysSinceMonday(daysSinceMonday) {
      if (!Number.isInteger(daysSinceMonday) || daysSinceMonday < 0 || daysSinceMonday >= 7) {
        throw TimeError.invalidDaysSinceMonday(daysSinceMonday);
      }
      return new _DayOfWeek(daysSinceMonday);
    }
    static tryFromCodeName(codename) {
      const num = DayOfWeekNumbers.find((n) => names[n].codeName === codename.toLowerCase());
      if (num == null) {
        return null;
      }
      return new _DayOfWeek(num);
    }
  };
  var DayOfWeek = _DayOfWeek;
  DayOfWeek.mon = new _DayOfWeek(0);
  DayOfWeek.tue = new _DayOfWeek(1);
  DayOfWeek.wed = new _DayOfWeek(2);
  DayOfWeek.thu = new _DayOfWeek(3);
  DayOfWeek.fri = new _DayOfWeek(4);
  DayOfWeek.sat = new _DayOfWeek(5);
  DayOfWeek.sun = new _DayOfWeek(6);
  var names = {
    0: { full: "Monday", codeName: "mon" },
    1: { full: "Tuesday", codeName: "tue" },
    2: { full: "Wednesday", codeName: "wed" },
    3: { full: "Thursday", codeName: "thu" },
    4: { full: "Friday", codeName: "fri" },
    5: { full: "Saturday", codeName: "sat" },
    6: { full: "Sunday", codeName: "sun" }
  };

  // ts/time/local-time.ts
  var LocalTime = class {
    constructor(minuteOfDay) {
      if (!Number.isInteger(minuteOfDay) || minuteOfDay < 0 || minuteOfDay >= 60 * 24 * 2) {
        throw TimeError.timeOutOfRange(minuteOfDay);
      }
      this.minuteOfDay = minuteOfDay;
    }
    get hour() {
      return this.hour48 % 24;
    }
    get minute() {
      return this.minuteOfDay % 60;
    }
    get isNextDay() {
      return this.minuteOfDay >= 24 * 60;
    }
    get hour48() {
      return Math.floor(this.fractionalHour48);
    }
    get fractionalHour48() {
      return this.minuteOfDay / 60;
    }
    static fromTime(hour, minute, nextDay = false) {
      return new LocalTime((nextDay ? hour + 24 : hour) * 60 + minute);
    }
    static fromHour48(hour48, minute) {
      return new LocalTime(hour48 * 60 + minute);
    }
    static tryParse(value, nextDay = false) {
      const correctFormat = /^[0-9]{1,2}:[0-9]{2}$/g.test(value);
      if (!correctFormat) {
        return null;
      }
      const components = value.split(":");
      const hour = parseInt(components[0]);
      const minute = parseInt(components[1]);
      if (hour >= 24 || minute >= 60) {
        return null;
      }
      return LocalTime.fromTime(hour, minute, nextDay);
    }
    static parse(value, nextDay = false) {
      const val = LocalTime.tryParse(value, nextDay);
      if (val == null) {
        throw TimeError.badTimeString(value);
      }
      return val;
    }
    static parseWithMarker(value) {
      return this.parse(value.replace(">", ""), value.charAt(0) == ">");
    }
    toString(includeNextDayMarker) {
      return (this.isNextDay && includeNextDayMarker ? ">" : "") + `${this.hour.toFixed().padStart(2, "0")}:${this.minute.toFixed().padStart(2, "0")}`;
    }
    to12HString() {
      const hour12 = hour24To12(this.hour);
      return `${hour12.hour.toFixed()}:${this.minute.toFixed().padStart(2, "0")}${hour12.half}`;
    }
    isBefore(other) {
      return this.minuteOfDay < other.minuteOfDay;
    }
    isBeforeOrEqual(other) {
      return this.minuteOfDay <= other.minuteOfDay;
    }
    isAfter(other) {
      return !this.isBeforeOrEqual(other);
    }
    isAfterOrEqual(other) {
      return !this.isBefore(other);
    }
    equals(other) {
      return this.minuteOfDay == other.minuteOfDay;
    }
    yesterday() {
      return new LocalTime(this.minuteOfDay - 24 * 60);
    }
    tomorrow() {
      return new LocalTime(this.minuteOfDay + 24 * 60);
    }
    startOfHour() {
      return LocalTime.fromHour48(this.hour48, 0);
    }
    endOfHour() {
      if (this.minute == 0) {
        return this;
      }
      return LocalTime.fromHour48(this.hour48 + 1, 0);
    }
    static startOfTomorrow() {
      return new LocalTime(24 * 60);
    }
    static earliest(...times) {
      return new LocalTime(Math.min(...times.map((t) => t.minuteOfDay)));
    }
    static latest(...times) {
      return new LocalTime(Math.max(...times.map((t) => t.minuteOfDay)));
    }
  };
  function hour24To12(hour24) {
    return {
      hour: (hour24 + 11) % 12 + 1,
      half: hour24 < 12 ? "am" : "pm"
    };
  }

  // ts/canvas/gridlines-renderer.ts
  var latestDaySplitHour = 3;
  var daysMonToFri = [
    DayOfWeek.mon,
    DayOfWeek.tue,
    DayOfWeek.wed,
    DayOfWeek.thu,
    DayOfWeek.fri
  ];
  var daysMonToSun = [...daysMonToFri, DayOfWeek.sat, DayOfWeek.sun];
  var defaultDays = daysMonToSun;
  var defaultStartHour = 8;
  var defaultEndHour = 20;
  var GridlinesRenderer = class {
    constructor(canvas3) {
      this._canvas = canvas3;
      this.days = defaultDays;
      this.startHour = defaultStartHour;
      this.endHour = defaultEndHour;
    }
    onTimetableUpdate(timetable2) {
      if (timetable2.timetable.classes.length > 0) {
        const range = determineHourRange(timetable2.timetable);
        this.startHour = range.start;
        this.endHour = range.end;
        const splitTime = LocalTime.fromHour48(this.endHour, 0);
        this.days = timetable2.timetable.hasWeekendOptions(splitTime) ? daysMonToSun : daysMonToFri;
      } else {
        this.days = defaultDays;
        this.startHour = defaultStartHour;
        this.endHour = defaultEndHour;
      }
    }
    draw(ctx) {
      this._drawGridlines(ctx);
      this._drawDragPrompt(ctx);
    }
    gridDimensions() {
      const timesStart = rem(1);
      const timesWidth = rem(2.5);
      const x1 = timesStart + timesWidth;
      const x2 = this._canvas.width - rem(1);
      const daysStart = rem(1);
      const daysHeight = rem(1.5);
      const y1 = daysStart + daysHeight;
      const y2 = this._canvas.height - rem(1.1 + 1.2 + 1.1);
      const dayWidth = (x2 - x1) / this.days.length;
      const hourHeight = (y2 - y1) / (this.endHour - this.startHour);
      return {
        timesStart,
        timesWidth,
        x1,
        x2,
        daysStart,
        daysHeight,
        y1,
        y2,
        dayWidth,
        hourHeight
      };
    }
    timeLocation(dayOfWeek, time) {
      if (time.fractionalHour48 < this.startHour) {
        if (time.tomorrow().fractionalHour48 > this.endHour) {
          return null;
        }
        const dayIndex2 = this.days.findIndex((d) => d.equals(dayOfWeek.yesterday()));
        if (dayIndex2 == -1) {
          return null;
        }
        return { x: dayIndex2, y: time.tomorrow().fractionalHour48 - this.startHour };
      }
      if (time.fractionalHour48 > this.endHour) {
        if (time.yesterday().fractionalHour48 < this.startHour) {
          return null;
        }
        const dayIndex2 = this.days.findIndex((d) => d.equals(dayOfWeek.tomorrow()));
        if (dayIndex2 == -1) {
          return null;
        }
        return { x: dayIndex2, y: time.yesterday().fractionalHour48 - this.startHour };
      }
      const dayIndex = this.days.findIndex((d) => d.equals(dayOfWeek));
      if (dayIndex == -1) {
        return null;
      }
      return { x: dayIndex, y: time.fractionalHour48 - this.startHour };
    }
    _drawGridlines(ctx) {
      const colorInk80 = this._canvas.css.colorInk80;
      const colorInk30 = this._canvas.css.colorInk30;
      const colorInk10 = this._canvas.css.colorInk10;
      const {
        x1,
        y1,
        x2,
        y2,
        dayWidth,
        daysStart,
        hourHeight,
        timesStart
      } = this.gridDimensions();
      drawLine(ctx, x1, y1, x2, y1, colorInk30, 2);
      for (let i = 1; i < this.days.length; i++) {
        const dayDividerX = x1 + dayWidth * i;
        drawLine(ctx, dayDividerX, y1, dayDividerX, y2, colorInk10, 2);
      }
      const fullLabelMinWidth = rem(4);
      this.days.forEach((dow, i) => {
        const dayName = dow.codeName.toUpperCase();
        const text = dayWidth > fullLabelMinWidth ? dayName : dayName[0];
        const textWidth = measureText(ctx, text, 1, "bold");
        const textX = x1 + dayWidth * i + (dayWidth - textWidth) / 2;
        const textY = daysStart;
        drawText(ctx, text, textX, textY, 1, "bold", colorInk80);
      });
      const times = [];
      for (let i = this.startHour; i <= this.endHour; i++) {
        const hour12 = hour24To12(i % 24);
        const timeString = `${hour12.hour.toFixed()}${hour12.half}`;
        times.push(timeString);
      }
      times.forEach((text, i) => {
        const textX = timesStart;
        const textY = y1 + hourHeight * i - rem(0.75) / 2;
        drawText(ctx, text, textX, textY, 0.75, null, colorInk80);
        if (i != 0) {
          const hourDividerY = y1 + hourHeight * i;
          drawLine(ctx, x1, hourDividerY, x2, hourDividerY, colorInk10, 2);
        }
      });
    }
    _drawDragPrompt(ctx) {
      const width = this._canvas.width;
      const height = this._canvas.height;
      const color = this._canvas.css.colorInk80;
      const iconSizeRem = 1.2;
      const bottomMarginRem = 1.1;
      const gapRem = 0.5;
      const textYOffset = 1;
      const text = "Drag blocks to switch options";
      const textWidth = measureText(ctx, text, 1, null);
      const totalWidth = textWidth + rem(iconSizeRem) + rem(gapRem);
      const textX = (width - totalWidth) / 2 + rem(iconSizeRem) + rem(gapRem);
      const textY = height - rem(bottomMarginRem + textYOffset);
      drawText(ctx, text, textX, textY, 1, null, color);
      const icon = new Path2D(
        "M21.92 2.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L4 18.59V15a1 1 0 0 0-2 0v6a1 1 0 0 0 .08.38a1 1 0 0 0 .54.54A1 1 0 0 0 3 22h6a1 1 0 0 0 0-2H5.41L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38Z"
      );
      const iconX = (width - totalWidth) / 2;
      const iconY = height - rem(bottomMarginRem + iconSizeRem);
      const iconScale = rem(iconSizeRem) / 24;
      drawIcon(ctx, icon, iconX, iconY, iconScale, color);
    }
  };
  function determineHourRange(timetable2) {
    const earliestHour = timetable2.earliestStartTime().startOfHour().hour48;
    const latestHour = timetable2.latestEndTime().endOfHour().hour48;
    const split = Math.min(earliestHour, latestDaySplitHour);
    if (latestHour <= 24 || latestHour <= split + 24) {
      return {
        start: earliestHour,
        end: latestHour
      };
    }
    return {
      start: split,
      end: split + 24
    };
  }

  // ts/canvas/timetable-renderer.ts
  var TimetableRenderer = class {
    constructor(canvas3) {
      this._canvas = canvas3;
      this._gridlines = new GridlinesRenderer(canvas3);
      this._blocks = new BlocksRenderer(canvas3, this._gridlines);
    }
    onTimetableUpdate(timetable2) {
      this._gridlines.onTimetableUpdate(timetable2);
      this._blocks.onTimetableUpdate(timetable2);
      this._canvas.markDirty();
    }
    draw(ctx) {
      this._gridlines.draw(ctx);
      this._blocks.draw(ctx);
    }
    onPointerDown(e) {
      this._blocks.onPointerDown(e);
    }
    onPointerUp(e) {
      this._blocks.onPointerUp(e);
    }
    onPointerMove(e) {
      this._blocks.onPointerMove(e);
    }
  };

  // ts/canvas/canvas-controller.ts
  var CanvasController = class {
    constructor(html2) {
      this._html = html2;
      this.width = 0;
      this.height = 0;
      this.dpiRatio = 1;
      this._ctx = (() => {
        const maybe = html2.canvas.getContext("2d");
        if (maybe == null) {
          throw new Error("Cannot get canvas context");
        }
        return maybe;
      })();
      this.css = (() => {
        const style = getComputedStyle(html2.canvas);
        return {
          colorInk10: style.getPropertyValue("--color-ink-10"),
          colorInk30: style.getPropertyValue("--color-ink-30"),
          colorInk80: style.getPropertyValue("--color-ink-80"),
          classColors: {
            "red": {
              gradient1: style.getPropertyValue("--color-accent-red-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-red-gradient-2")
            },
            "orange": {
              gradient1: style.getPropertyValue("--color-accent-orange-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-orange-gradient-2")
            },
            "yellow": {
              gradient1: style.getPropertyValue("--color-accent-yellow-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-yellow-gradient-2")
            },
            "green": {
              gradient1: style.getPropertyValue("--color-accent-green-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-green-gradient-2")
            },
            "cyan": {
              gradient1: style.getPropertyValue("--color-accent-cyan-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-cyan-gradient-2")
            },
            "blue": {
              gradient1: style.getPropertyValue("--color-accent-blue-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-blue-gradient-2")
            },
            "purple": {
              gradient1: style.getPropertyValue("--color-accent-purple-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-purple-gradient-2")
            },
            "pink": {
              gradient1: style.getPropertyValue("--color-accent-pink-gradient-1"),
              gradient2: style.getPropertyValue("--color-accent-pink-gradient-2")
            }
          }
        };
      })();
      this._lastFrameTime = null;
      this._animations = [];
      this._renderer = new TimetableRenderer(this);
      this._html.canvas.addEventListener(
        "pointerdown",
        (e) => this._renderer.onPointerDown(e)
      );
      this._html.canvas.addEventListener(
        "pointerup",
        (e) => this._renderer.onPointerUp(e)
      );
      this._html.canvas.addEventListener(
        "pointerleave",
        (e) => this._renderer.onPointerUp(e)
      );
      this._html.canvas.addEventListener(
        "pointermove",
        (e) => this._renderer.onPointerMove(e)
      );
      this._dirty = true;
      this._startDrawLoop();
    }
    _startDrawLoop() {
      var _a;
      requestAnimationFrame(() => this._startDrawLoop());
      const now = Date.now();
      const delta = (now - ((_a = this._lastFrameTime) != null ? _a : now)) / 1e3;
      this._lastFrameTime = now;
      if (!this._dirty && this._animations.length < 1) {
        return;
      }
      this._dirty = false;
      this._draw(delta);
    }
    _draw(delta) {
      this._ctx.save();
      this._ctx.clearRect(
        0,
        0,
        this.width * this.dpiRatio,
        this.height * this.dpiRatio
      );
      this._ctx.scale(this.dpiRatio, this.dpiRatio);
      if (this._animations.length > 0) {
        const animationsToDelete = [];
        this._animations.forEach((a) => {
          a.run(delta);
          if (a.isDone()) {
            animationsToDelete.push(a);
          }
        });
        animationsToDelete.forEach((a) => {
          this._animations.splice(this._animations.indexOf(a), 1);
        });
      }
      this._renderer.draw(this._ctx);
      this._ctx.restore();
    }
    markDirty() {
      this._dirty = true;
    }
    fitCanvas() {
      const containerSize = this._html.canvasContainer.getBoundingClientRect();
      this.width = containerSize.width;
      this.height = containerSize.height;
      const ctx = this._html.canvas.getContext("2d");
      if (ctx == null) {
        throw new Error("Cannot get canvas context");
      }
      this.dpiRatio = calculateDpiRatio(ctx);
      this._html.canvas.style.width = `${this.width}px`;
      this._html.canvas.style.height = `${this.height}px`;
      this._html.canvas.width = this.width * this.dpiRatio;
      this._html.canvas.height = this.height * this.dpiRatio;
      this.markDirty();
    }
    startAnimation(animation) {
      this._animations.push(animation);
    }
    cancelAnimation(animation) {
      const index = this._animations.indexOf(animation);
      if (index == -1) {
        throw new Error("Couldn't find that animation to cancel.");
      }
      this._animations.splice(index, 1);
    }
    onTimetableUpdate(timetable2) {
      this._renderer.onTimetableUpdate(timetable2);
    }
  };
  function calculateDpiRatio(ctx) {
    var _a, _b;
    const dpr = (_a = window.devicePixelRatio) != null ? _a : 1;
    const bsr = (_b = ctx.backingStorePixelRatio) != null ? _b : 1;
    return dpr / bsr;
  }

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = {
    randomUUID
  };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    const rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // ts/class-ui-controller.ts
  var ClassUIController = class {
    constructor(timetableClass, $div, $noChoiceInput, optionRadios) {
      this.timetableClass = timetableClass;
      this.$div = $div;
      this._$noChoiceInput = $noChoiceInput;
      this._optionRadios = optionRadios;
    }
    select(option) {
      if (option == null) {
        if (!this._$noChoiceInput.checked) {
          this._$noChoiceInput.checked = true;
        }
        return;
      }
      const optionRadio = this._optionRadios.find((o) => o.option.equals(option));
      if (optionRadio == null) {
        throw new Error();
      }
      if (!optionRadio.$radio.checked) {
        optionRadio.$radio.checked = true;
      }
    }
    static create(classData) {
      const $name = document.createElement("h3");
      $name.textContent = classData.name;
      const $nameOL = document.createElement("div");
      $nameOL.className = "one-line";
      $nameOL.append($name);
      const $type = document.createElement("h4");
      $type.textContent = classData.type.toUpperCase();
      const $typeOL = document.createElement("div");
      $typeOL.className = "one-line";
      $typeOL.append($type);
      const $options = document.createElement("div");
      $options.className = "options";
      const radiosName = v4_default();
      const createOptionUI = ($inner) => {
        const $input = document.createElement("input");
        $input.type = "radio";
        $input.name = radiosName;
        $input.autocomplete = "off";
        const $button = document.createElement("div");
        $button.className = "button";
        $button.append($inner);
        const $label = document.createElement("label");
        $label.className = "option";
        $label.append($input, $button);
        return { $label, $input };
      };
      const optionUIs = classData.options.map((o) => {
        const $text = document.createElement("p");
        $text.textContent = o.toDisplayString();
        const $textOL = document.createElement("div");
        $textOL.className = "one-line";
        $textOL.append($text);
        const ui = createOptionUI($textOL);
        ui.$input.addEventListener("click", () => {
          updateTimetable(getCurrentTimetable().withChoice(classData, o));
        });
        return { option: o, $label: ui.$label, $input: ui.$input };
      });
      const noChoiceOptionUI = (() => {
        const $text = document.createElement("p");
        $text.textContent = "None";
        const $textOL = document.createElement("div");
        $textOL.className = "one-line";
        $textOL.append($text);
        const ui = createOptionUI($textOL);
        ui.$input.addEventListener("click", () => {
          updateTimetable(getCurrentTimetable().withChoice(classData, null));
        });
        return { $label: ui.$label, $input: ui.$input };
      })();
      $options.append(noChoiceOptionUI.$label, ...optionUIs.map((o) => o.$label));
      const $div = document.createElement("div");
      $div.className = "class";
      $div.append($nameOL, $typeOL, $options);
      const optionRadios = optionUIs.map((o) => {
        return { option: o.option, $radio: o.$input };
      });
      return new ClassUIController(
        classData,
        $div,
        noChoiceOptionUI.$input,
        optionRadios
      );
    }
  };

  // ts/controls-controller.ts
  var ControlsController = class {
    constructor(html2) {
      this._html = html2;
      this._prevTimetable = null;
      this._classUIs = [];
    }
    onTimetableUpdate(timetable2) {
      if (this._prevTimetable == null || !timetable2.timetable.equals(this._prevTimetable.timetable)) {
        this._html.controls.classList.toggle(
          "non-empty",
          timetable2.timetable.classes.length != 0
        );
        this._classUIs = timetable2.timetable.classes.map((cl) => {
          const choice = timetable2.choices.find((ch) => ch.timetableClass.equals(cl));
          if (choice == null) {
            throw new Error();
          }
          const ui = ClassUIController.create(cl);
          ui.select(choice.option);
          return ui;
        });
        this._html.classes.replaceChildren(...this._classUIs.map((u) => u.$div));
      }
      timetable2.choices.forEach((ch) => {
        const classUI = this._classUIs.find(
          (u) => u.timetableClass.equals(ch.timetableClass)
        );
        if (classUI == null) {
          throw new Error();
        }
        classUI.select(ch.option);
      });
      this._prevTimetable = timetable2;
    }
  };

  // node_modules/zod/lib/index.mjs
  var util;
  (function(util2) {
    util2.assertEqual = (val) => val;
    function assertIs(_arg) {
    }
    util2.assertIs = assertIs;
    function assertNever(_x) {
      throw new Error();
    }
    util2.assertNever = assertNever;
    util2.arrayToEnum = (items) => {
      const obj = {};
      for (const item of items) {
        obj[item] = item;
      }
      return obj;
    };
    util2.getValidEnumValues = (obj) => {
      const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
      const filtered = {};
      for (const k of validKeys) {
        filtered[k] = obj[k];
      }
      return util2.objectValues(filtered);
    };
    util2.objectValues = (obj) => {
      return util2.objectKeys(obj).map(function(e) {
        return obj[e];
      });
    };
    util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
      const keys = [];
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          keys.push(key);
        }
      }
      return keys;
    };
    util2.find = (arr, checker) => {
      for (const item of arr) {
        if (checker(item))
          return item;
      }
      return void 0;
    };
    util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
      return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
    }
    util2.joinValues = joinValues;
    util2.jsonStringifyReplacer = (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    };
  })(util || (util = {}));
  var ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set"
  ]);
  var getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
      case "undefined":
        return ZodParsedType.undefined;
      case "string":
        return ZodParsedType.string;
      case "number":
        return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
      case "boolean":
        return ZodParsedType.boolean;
      case "function":
        return ZodParsedType.function;
      case "bigint":
        return ZodParsedType.bigint;
      case "object":
        if (Array.isArray(data)) {
          return ZodParsedType.array;
        }
        if (data === null) {
          return ZodParsedType.null;
        }
        if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
          return ZodParsedType.promise;
        }
        if (typeof Map !== "undefined" && data instanceof Map) {
          return ZodParsedType.map;
        }
        if (typeof Set !== "undefined" && data instanceof Set) {
          return ZodParsedType.set;
        }
        if (typeof Date !== "undefined" && data instanceof Date) {
          return ZodParsedType.date;
        }
        return ZodParsedType.object;
      default:
        return ZodParsedType.unknown;
    }
  };
  var ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of"
  ]);
  var quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
  };
  var ZodError = class extends Error {
    constructor(issues) {
      super();
      this.issues = [];
      this.addIssue = (sub) => {
        this.issues = [...this.issues, sub];
      };
      this.addIssues = (subs = []) => {
        this.issues = [...this.issues, ...subs];
      };
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        this.__proto__ = actualProto;
      }
      this.name = "ZodError";
      this.issues = issues;
    }
    get errors() {
      return this.issues;
    }
    format(_mapper) {
      const mapper = _mapper || function(issue) {
        return issue.message;
      };
      const fieldErrors = { _errors: [] };
      const processError = (error) => {
        for (const issue of error.issues) {
          if (issue.code === "invalid_union") {
            issue.unionErrors.map(processError);
          } else if (issue.code === "invalid_return_type") {
            processError(issue.returnTypeError);
          } else if (issue.code === "invalid_arguments") {
            processError(issue.argumentsError);
          } else if (issue.path.length === 0) {
            fieldErrors._errors.push(mapper(issue));
          } else {
            let curr = fieldErrors;
            let i = 0;
            while (i < issue.path.length) {
              const el = issue.path[i];
              const terminal = i === issue.path.length - 1;
              if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
              } else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(mapper(issue));
              }
              curr = curr[el];
              i++;
            }
          }
        }
      };
      processError(this);
      return fieldErrors;
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
      const fieldErrors = {};
      const formErrors = [];
      for (const sub of this.issues) {
        if (sub.path.length > 0) {
          fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
          fieldErrors[sub.path[0]].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    get formErrors() {
      return this.flatten();
    }
  };
  ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
  };
  var errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === ZodParsedType.undefined) {
          message = "Required";
        } else {
          message = `Expected ${issue.expected}, received ${issue.received}`;
        }
        break;
      case ZodIssueCode.invalid_literal:
        message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
        break;
      case ZodIssueCode.unrecognized_keys:
        message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
        break;
      case ZodIssueCode.invalid_union:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_union_discriminator:
        message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
        break;
      case ZodIssueCode.invalid_enum_value:
        message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
        break;
      case ZodIssueCode.invalid_arguments:
        message = `Invalid function arguments`;
        break;
      case ZodIssueCode.invalid_return_type:
        message = `Invalid function return type`;
        break;
      case ZodIssueCode.invalid_date:
        message = `Invalid date`;
        break;
      case ZodIssueCode.invalid_string:
        if (typeof issue.validation === "object") {
          if ("startsWith" in issue.validation) {
            message = `Invalid input: must start with "${issue.validation.startsWith}"`;
          } else if ("endsWith" in issue.validation) {
            message = `Invalid input: must end with "${issue.validation.endsWith}"`;
          } else {
            util.assertNever(issue.validation);
          }
        } else if (issue.validation !== "regex") {
          message = `Invalid ${issue.validation}`;
        } else {
          message = "Invalid";
        }
        break;
      case ZodIssueCode.too_small:
        if (issue.type === "array")
          message = `Array must contain ${issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be greater than ${issue.inclusive ? `or equal to ` : ``}${issue.minimum}`;
        else if (issue.type === "date")
          message = `Date must be greater than ${issue.inclusive ? `or equal to ` : ``}${new Date(issue.minimum)}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.too_big:
        if (issue.type === "array")
          message = `Array must contain ${issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be less than ${issue.inclusive ? `or equal to ` : ``}${issue.maximum}`;
        else if (issue.type === "date")
          message = `Date must be smaller than ${issue.inclusive ? `or equal to ` : ``}${new Date(issue.maximum)}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.custom:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_intersection_types:
        message = `Intersection results could not be merged`;
        break;
      case ZodIssueCode.not_multiple_of:
        message = `Number must be a multiple of ${issue.multipleOf}`;
        break;
      default:
        message = _ctx.defaultError;
        util.assertNever(issue);
    }
    return { message };
  };
  var overrideErrorMap = errorMap;
  function setErrorMap(map2) {
    overrideErrorMap = map2;
  }
  function getErrorMap() {
    return overrideErrorMap;
  }
  var makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...issueData.path || []];
    const fullIssue = {
      ...issueData,
      path: fullPath
    };
    let errorMessage = "";
    const maps = errorMaps.filter((m) => !!m).slice().reverse();
    for (const map2 of maps) {
      errorMessage = map2(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message || errorMessage
    };
  };
  var EMPTY_PATH = [];
  function addIssueToContext(ctx, issueData) {
    const issue = makeIssue({
      issueData,
      data: ctx.data,
      path: ctx.path,
      errorMaps: [
        ctx.common.contextualErrorMap,
        ctx.schemaErrorMap,
        getErrorMap(),
        errorMap
      ].filter((x) => !!x)
    });
    ctx.common.issues.push(issue);
  }
  var ParseStatus = class {
    constructor() {
      this.value = "valid";
    }
    dirty() {
      if (this.value === "valid")
        this.value = "dirty";
    }
    abort() {
      if (this.value !== "aborted")
        this.value = "aborted";
    }
    static mergeArray(status, results) {
      const arrayValue = [];
      for (const s of results) {
        if (s.status === "aborted")
          return INVALID;
        if (s.status === "dirty")
          status.dirty();
        arrayValue.push(s.value);
      }
      return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
      const syncPairs = [];
      for (const pair of pairs) {
        syncPairs.push({
          key: await pair.key,
          value: await pair.value
        });
      }
      return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
      const finalObject = {};
      for (const pair of pairs) {
        const { key, value } = pair;
        if (key.status === "aborted")
          return INVALID;
        if (value.status === "aborted")
          return INVALID;
        if (key.status === "dirty")
          status.dirty();
        if (value.status === "dirty")
          status.dirty();
        if (typeof value.value !== "undefined" || pair.alwaysSet) {
          finalObject[key.value] = value.value;
        }
      }
      return { status: status.value, value: finalObject };
    }
  };
  var INVALID = Object.freeze({
    status: "aborted"
  });
  var DIRTY = (value) => ({ status: "dirty", value });
  var OK = (value) => ({ status: "valid", value });
  var isAborted = (x) => x.status === "aborted";
  var isDirty = (x) => x.status === "dirty";
  var isValid = (x) => x.status === "valid";
  var isAsync = (x) => typeof Promise !== void 0 && x instanceof Promise;
  var errorUtil;
  (function(errorUtil2) {
    errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
  })(errorUtil || (errorUtil = {}));
  var ParseInputLazyPath = class {
    constructor(parent, value, path, key) {
      this.parent = parent;
      this.data = value;
      this._path = path;
      this._key = key;
    }
    get path() {
      return this._path.concat(this._key);
    }
  };
  var handleResult = (ctx, result) => {
    if (isValid(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }
      const error = new ZodError(ctx.common.issues);
      return { success: false, error };
    }
  };
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
    if (errorMap2 && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap2)
      return { errorMap: errorMap2, description };
    const customMap = (iss, ctx) => {
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      if (typeof ctx.data === "undefined") {
        return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
      }
      return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
    };
    return { errorMap: customMap, description };
  }
  var ZodType = class {
    constructor(def) {
      this.spa = this.safeParseAsync;
      this.superRefine = this._refinement;
      this._def = def;
      this.parse = this.parse.bind(this);
      this.safeParse = this.safeParse.bind(this);
      this.parseAsync = this.parseAsync.bind(this);
      this.safeParseAsync = this.safeParseAsync.bind(this);
      this.spa = this.spa.bind(this);
      this.refine = this.refine.bind(this);
      this.refinement = this.refinement.bind(this);
      this.superRefine = this.superRefine.bind(this);
      this.optional = this.optional.bind(this);
      this.nullable = this.nullable.bind(this);
      this.nullish = this.nullish.bind(this);
      this.array = this.array.bind(this);
      this.promise = this.promise.bind(this);
      this.or = this.or.bind(this);
      this.and = this.and.bind(this);
      this.transform = this.transform.bind(this);
      this.default = this.default.bind(this);
      this.describe = this.describe.bind(this);
      this.isNullable = this.isNullable.bind(this);
      this.isOptional = this.isOptional.bind(this);
    }
    get description() {
      return this._def.description;
    }
    _getType(input2) {
      return getParsedType(input2.data);
    }
    _getOrReturnCtx(input2, ctx) {
      return ctx || {
        common: input2.parent.common,
        data: input2.data,
        parsedType: getParsedType(input2.data),
        schemaErrorMap: this._def.errorMap,
        path: input2.path,
        parent: input2.parent
      };
    }
    _processInputParams(input2) {
      return {
        status: new ParseStatus(),
        ctx: {
          common: input2.parent.common,
          data: input2.data,
          parsedType: getParsedType(input2.data),
          schemaErrorMap: this._def.errorMap,
          path: input2.path,
          parent: input2.parent
        }
      };
    }
    _parseSync(input2) {
      const result = this._parse(input2);
      if (isAsync(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input2) {
      const result = this._parse(input2);
      return Promise.resolve(result);
    }
    parse(data, params) {
      const result = this.safeParse(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    safeParse(data, params) {
      var _a;
      const ctx = {
        common: {
          issues: [],
          async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
          contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
        },
        path: (params === null || params === void 0 ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const result = this._parseSync({ data, path: ctx.path, parent: ctx });
      return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
      const result = await this.safeParseAsync(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    async safeParseAsync(data, params) {
      const ctx = {
        common: {
          issues: [],
          contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
          async: true
        },
        path: (params === null || params === void 0 ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const maybeAsyncResult = this._parse({ data, path: [], parent: ctx });
      const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
      return handleResult(ctx, result);
    }
    refine(check, message) {
      const getIssueProperties = (val) => {
        if (typeof message === "string" || typeof message === "undefined") {
          return { message };
        } else if (typeof message === "function") {
          return message(val);
        } else {
          return message;
        }
      };
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () => ctx.addIssue({
          code: ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
        if (typeof Promise !== "undefined" && result instanceof Promise) {
          return result.then((data) => {
            if (!data) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        if (!result) {
          setError();
          return false;
        } else {
          return true;
        }
      });
    }
    refinement(check, refinementData) {
      return this._refinement((val, ctx) => {
        if (!check(val)) {
          ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
          return false;
        } else {
          return true;
        }
      });
    }
    _refinement(refinement) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "refinement", refinement }
      });
    }
    optional() {
      return ZodOptional.create(this);
    }
    nullable() {
      return ZodNullable.create(this);
    }
    nullish() {
      return this.optional().nullable();
    }
    array() {
      return ZodArray.create(this);
    }
    promise() {
      return ZodPromise.create(this);
    }
    or(option) {
      return ZodUnion.create([this, option]);
    }
    and(incoming) {
      return ZodIntersection.create(this, incoming);
    }
    transform(transform) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "transform", transform }
      });
    }
    default(def) {
      const defaultValueFunc = typeof def === "function" ? def : () => def;
      return new ZodDefault({
        innerType: this,
        defaultValue: defaultValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodDefault
      });
    }
    brand() {
      return new ZodBranded({
        typeName: ZodFirstPartyTypeKind.ZodBranded,
        type: this,
        ...processCreateParams(void 0)
      });
    }
    describe(description) {
      const This = this.constructor;
      return new This({
        ...this._def,
        description
      });
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  };
  var cuidRegex = /^c[^\s-]{8,}$/i;
  var uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
  var emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  var ZodString = class extends ZodType {
    constructor() {
      super(...arguments);
      this._regex = (regex, validation, message) => this.refinement((data) => regex.test(data), {
        validation,
        code: ZodIssueCode.invalid_string,
        ...errorUtil.errToObj(message)
      });
      this.nonempty = (message) => this.min(1, errorUtil.errToObj(message));
      this.trim = () => new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "trim" }]
      });
    }
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(
          ctx2,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          }
        );
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input2.data.length < check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input2.data.length > check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "email") {
          if (!emailRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input2.data);
          } catch (_a) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input2.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "trim") {
          input2.data = input2.data.trim();
        } else if (check.kind === "startsWith") {
          if (!input2.data.startsWith(check.value)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "endsWith") {
          if (!input2.data.endsWith(check.value)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input2.data };
    }
    _addCheck(check) {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    email(message) {
      return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
      return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
      return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
      return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    regex(regex, message) {
      return this._addCheck({
        kind: "regex",
        regex,
        ...errorUtil.errToObj(message)
      });
    }
    startsWith(value, message) {
      return this._addCheck({
        kind: "startsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    endsWith(value, message) {
      return this._addCheck({
        kind: "endsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    min(minLength, message) {
      return this._addCheck({
        kind: "min",
        value: minLength,
        ...errorUtil.errToObj(message)
      });
    }
    max(maxLength, message) {
      return this._addCheck({
        kind: "max",
        value: maxLength,
        ...errorUtil.errToObj(message)
      });
    }
    length(len, message) {
      return this.min(len, message).max(len, message);
    }
    get isEmail() {
      return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isUUID() {
      return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isCUID() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get minLength() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxLength() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  };
  ZodString.create = (params) => {
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      ...processCreateParams(params)
    });
  };
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / Math.pow(10, decCount);
  }
  var ZodNumber = class extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
      this.step = this.multipleOf;
    }
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util.isInteger(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input2.data < check.value : input2.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input2.data > check.value : input2.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(input2.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input2.data };
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodNumber({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodNumber({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    int(message) {
      return this._addCheck({
        kind: "int",
        message: errorUtil.toString(message)
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
    get isInt() {
      return !!this._def.checks.find((ch) => ch.kind === "int");
    }
  };
  ZodNumber.create = (params) => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      ...processCreateParams(params)
    });
  };
  var ZodBigInt = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.bigint) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  };
  ZodBigInt.create = (params) => {
    return new ZodBigInt({
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      ...processCreateParams(params)
    });
  };
  var ZodBoolean = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  };
  ZodBoolean.create = (params) => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      ...processCreateParams(params)
    });
  };
  var ZodDate = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.date) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      if (isNaN(input2.data.getTime())) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_date
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input2.data.getTime() < check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              message: check.message,
              inclusive: true,
              minimum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input2.data.getTime() > check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              message: check.message,
              inclusive: true,
              maximum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return {
        status: status.value,
        value: new Date(input2.data.getTime())
      };
    }
    _addCheck(check) {
      return new ZodDate({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    min(minDate, message) {
      return this._addCheck({
        kind: "min",
        value: minDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    max(maxDate, message) {
      return this._addCheck({
        kind: "max",
        value: maxDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    get minDate() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min != null ? new Date(min) : null;
    }
    get maxDate() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max != null ? new Date(max) : null;
    }
  };
  ZodDate.create = (params) => {
    return new ZodDate({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams(params)
    });
  };
  var ZodUndefined = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  };
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams(params)
    });
  };
  var ZodNull = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  };
  ZodNull.create = (params) => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams(params)
    });
  };
  var ZodAny = class extends ZodType {
    constructor() {
      super(...arguments);
      this._any = true;
    }
    _parse(input2) {
      return OK(input2.data);
    }
  };
  ZodAny.create = (params) => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams(params)
    });
  };
  var ZodUnknown = class extends ZodType {
    constructor() {
      super(...arguments);
      this._unknown = true;
    }
    _parse(input2) {
      return OK(input2.data);
    }
  };
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams(params)
    });
  };
  var ZodNever = class extends ZodType {
    _parse(input2) {
      const ctx = this._getOrReturnCtx(input2);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: ctx.parsedType
      });
      return INVALID;
    }
  };
  ZodNever.create = (params) => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams(params)
    });
  };
  var ZodVoid = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  };
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams(params)
    });
  };
  var ZodArray = class extends ZodType {
    _parse(input2) {
      const { ctx, status } = this._processInputParams(input2);
      const def = this._def;
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            message: def.minLength.message
          });
          status.dirty();
        }
      }
      if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            message: def.maxLength.message
          });
          status.dirty();
        }
      }
      if (ctx.common.async) {
        return Promise.all(ctx.data.map((item, i) => {
          return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        })).then((result2) => {
          return ParseStatus.mergeArray(status, result2);
        });
      }
      const result = ctx.data.map((item, i) => {
        return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      });
      return ParseStatus.mergeArray(status, result);
    }
    get element() {
      return this._def.type;
    }
    min(minLength, message) {
      return new ZodArray({
        ...this._def,
        minLength: { value: minLength, message: errorUtil.toString(message) }
      });
    }
    max(maxLength, message) {
      return new ZodArray({
        ...this._def,
        maxLength: { value: maxLength, message: errorUtil.toString(message) }
      });
    }
    length(len, message) {
      return this.min(len, message).max(len, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodArray.create = (schema, params) => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams(params)
    });
  };
  var objectUtil;
  (function(objectUtil2) {
    objectUtil2.mergeShapes = (first, second) => {
      return {
        ...first,
        ...second
      };
    };
  })(objectUtil || (objectUtil = {}));
  var AugmentFactory = (def) => (augmentation) => {
    return new ZodObject({
      ...def,
      shape: () => ({
        ...def.shape(),
        ...augmentation
      })
    });
  };
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return ZodArray.create(deepPartialify(schema.element));
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  var ZodObject = class extends ZodType {
    constructor() {
      super(...arguments);
      this._cached = null;
      this.nonstrict = this.passthrough;
      this.augment = AugmentFactory(this._def);
      this.extend = AugmentFactory(this._def);
    }
    _getCached() {
      if (this._cached !== null)
        return this._cached;
      const shape = this._def.shape();
      const keys = util.objectKeys(shape);
      return this._cached = { shape, keys };
    }
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const { status, ctx } = this._processInputParams(input2);
      const { shape, keys: shapeKeys } = this._getCached();
      const extraKeys = [];
      if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
        for (const key in ctx.data) {
          if (!shapeKeys.includes(key)) {
            extraKeys.push(key);
          }
        }
      }
      const pairs = [];
      for (const key of shapeKeys) {
        const keyValidator = shape[key];
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (this._def.catchall instanceof ZodNever) {
        const unknownKeys = this._def.unknownKeys;
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            pairs.push({
              key: { status: "valid", value: key },
              value: { status: "valid", value: ctx.data[key] }
            });
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys
            });
            status.dirty();
          }
        } else if (unknownKeys === "strip")
          ;
        else {
          throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
        }
      } else {
        const catchall = this._def.catchall;
        for (const key of extraKeys) {
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: catchall._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, key)
            ),
            alwaysSet: key in ctx.data
          });
        }
      }
      if (ctx.common.async) {
        return Promise.resolve().then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            syncPairs.push({
              key,
              value: await pair.value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        }).then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get shape() {
      return this._def.shape();
    }
    strict(message) {
      errorUtil.errToObj;
      return new ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...message !== void 0 ? {
          errorMap: (issue, ctx) => {
            var _a, _b, _c, _d;
            const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
            if (issue.code === "unrecognized_keys")
              return {
                message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
              };
            return {
              message: defaultError
            };
          }
        } : {}
      });
    }
    strip() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "strip"
      });
    }
    passthrough() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "passthrough"
      });
    }
    setKey(key, schema) {
      return this.augment({ [key]: schema });
    }
    merge(merging) {
      const merged = new ZodObject({
        unknownKeys: merging._def.unknownKeys,
        catchall: merging._def.catchall,
        shape: () => objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        typeName: ZodFirstPartyTypeKind.ZodObject
      });
      return merged;
    }
    catchall(index) {
      return new ZodObject({
        ...this._def,
        catchall: index
      });
    }
    pick(mask) {
      const shape = {};
      util.objectKeys(mask).map((key) => {
        if (this.shape[key])
          shape[key] = this.shape[key];
      });
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    omit(mask) {
      const shape = {};
      util.objectKeys(this.shape).map((key) => {
        if (util.objectKeys(mask).indexOf(key) === -1) {
          shape[key] = this.shape[key];
        }
      });
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    deepPartial() {
      return deepPartialify(this);
    }
    partial(mask) {
      const newShape = {};
      if (mask) {
        util.objectKeys(this.shape).map((key) => {
          if (util.objectKeys(mask).indexOf(key) === -1) {
            newShape[key] = this.shape[key];
          } else {
            newShape[key] = this.shape[key].optional();
          }
        });
        return new ZodObject({
          ...this._def,
          shape: () => newShape
        });
      } else {
        for (const key in this.shape) {
          const fieldSchema = this.shape[key];
          newShape[key] = fieldSchema.optional();
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    required() {
      const newShape = {};
      for (const key in this.shape) {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    keyof() {
      return createZodEnum(util.objectKeys(this.shape));
    }
  };
  ZodObject.create = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  var ZodUnion = class extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const options = this._def.options;
      function handleResults(results) {
        for (const result of results) {
          if (result.result.status === "valid") {
            return result.result;
          }
        }
        for (const result of results) {
          if (result.result.status === "dirty") {
            ctx.common.issues.push(...result.ctx.common.issues);
            return result.result;
          }
        }
        const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return Promise.all(options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })).then(handleResults);
      } else {
        let dirty = void 0;
        const issues = [];
        for (const option of options) {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          const result = option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          });
          if (result.status === "valid") {
            return result;
          } else if (result.status === "dirty" && !dirty) {
            dirty = { result, ctx: childCtx };
          }
          if (childCtx.common.issues.length) {
            issues.push(childCtx.common.issues);
          }
        }
        if (dirty) {
          ctx.common.issues.push(...dirty.ctx.common.issues);
          return dirty.result;
        }
        const unionErrors = issues.map((issues2) => new ZodError(issues2));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
    }
    get options() {
      return this._def.options;
    }
  };
  ZodUnion.create = (types, params) => {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams(params)
    });
  };
  var ZodDiscriminatedUnion = class extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const discriminator = this.discriminator;
      const discriminatorValue = ctx.data[discriminator];
      const option = this.options.get(discriminatorValue);
      if (!option) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union_discriminator,
          options: this.validDiscriminatorValues,
          path: [discriminator]
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return option._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      } else {
        return option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get validDiscriminatorValues() {
      return Array.from(this.options.keys());
    }
    get options() {
      return this._def.options;
    }
    static create(discriminator, types, params) {
      const options = /* @__PURE__ */ new Map();
      try {
        types.forEach((type) => {
          const discriminatorValue = type.shape[discriminator].value;
          options.set(discriminatorValue, type);
        });
      } catch (e) {
        throw new Error("The discriminator value could not be extracted from all the provided schemas");
      }
      if (options.size !== types.length) {
        throw new Error("Some of the discriminator values are not unique");
      }
      return new ZodDiscriminatedUnion({
        typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
        discriminator,
        options,
        ...processCreateParams(params)
      });
    }
  };
  function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
      return { valid: true, data: a };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util.objectKeys(b);
      const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a.length !== b.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
      return { valid: true, data: a };
    } else {
      return { valid: false };
    }
  }
  var ZodIntersection = class extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      const handleParsed = (parsedLeft, parsedRight) => {
        if (isAborted(parsedLeft) || isAborted(parsedRight)) {
          return INVALID;
        }
        const merged = mergeValues(parsedLeft.value, parsedRight.value);
        if (!merged.valid) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_intersection_types
          });
          return INVALID;
        }
        if (isDirty(parsedLeft) || isDirty(parsedRight)) {
          status.dirty();
        }
        return { status: status.value, value: merged.data };
      };
      if (ctx.common.async) {
        return Promise.all([
          this._def.left._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }),
          this._def.right._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          })
        ]).then(([left, right]) => handleParsed(left, right));
      } else {
        return handleParsed(this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }), this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }));
      }
    }
  };
  ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
      left,
      right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams(params)
    });
  };
  var ZodTuple = class extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (ctx.data.length < this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          type: "array"
        });
        return INVALID;
      }
      const rest = this._def.rest;
      if (!rest && ctx.data.length > this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          type: "array"
        });
        status.dirty();
      }
      const items = ctx.data.map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return null;
        return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
      }).filter((x) => !!x);
      if (ctx.common.async) {
        return Promise.all(items).then((results) => {
          return ParseStatus.mergeArray(status, results);
        });
      } else {
        return ParseStatus.mergeArray(status, items);
      }
    }
    get items() {
      return this._def.items;
    }
    rest(rest) {
      return new ZodTuple({
        ...this._def,
        rest
      });
    }
  };
  ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams(params)
    });
  };
  var ZodRecord = class extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const pairs = [];
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      for (const key in ctx.data) {
        pairs.push({
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
          value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
        });
      }
      if (ctx.common.async) {
        return ParseStatus.mergeObjectAsync(status, pairs);
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get element() {
      return this._def.valueType;
    }
    static create(first, second, third) {
      if (second instanceof ZodType) {
        return new ZodRecord({
          keyType: first,
          valueType: second,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(third)
        });
      }
      return new ZodRecord({
        keyType: ZodString.create(),
        valueType: first,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(second)
      });
    }
  };
  var ZodMap = class extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.map) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      const pairs = [...ctx.data.entries()].map(([key, value], index) => {
        return {
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
          value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
        };
      });
      if (ctx.common.async) {
        const finalMap = /* @__PURE__ */ new Map();
        return Promise.resolve().then(async () => {
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        });
      } else {
        const finalMap = /* @__PURE__ */ new Map();
        for (const pair of pairs) {
          const key = pair.key;
          const value = pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      }
    }
  };
  ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams(params)
    });
  };
  var ZodSet = class extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.set) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const def = this._def;
      if (def.minSize !== null) {
        if (ctx.data.size < def.minSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            message: def.minSize.message
          });
          status.dirty();
        }
      }
      if (def.maxSize !== null) {
        if (ctx.data.size > def.maxSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            message: def.maxSize.message
          });
          status.dirty();
        }
      }
      const valueType = this._def.valueType;
      function finalizeSet(elements2) {
        const parsedSet = /* @__PURE__ */ new Set();
        for (const element of elements2) {
          if (element.status === "aborted")
            return INVALID;
          if (element.status === "dirty")
            status.dirty();
          parsedSet.add(element.value);
        }
        return { status: status.value, value: parsedSet };
      }
      const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
      if (ctx.common.async) {
        return Promise.all(elements).then((elements2) => finalizeSet(elements2));
      } else {
        return finalizeSet(elements);
      }
    }
    min(minSize, message) {
      return new ZodSet({
        ...this._def,
        minSize: { value: minSize, message: errorUtil.toString(message) }
      });
    }
    max(maxSize, message) {
      return new ZodSet({
        ...this._def,
        maxSize: { value: maxSize, message: errorUtil.toString(message) }
      });
    }
    size(size, message) {
      return this.min(size, message).max(size, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodSet.create = (valueType, params) => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams(params)
    });
  };
  var ZodFunction = class extends ZodType {
    constructor() {
      super(...arguments);
      this.validate = this.implement;
    }
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.function) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: ctx.parsedType
        });
        return INVALID;
      }
      function makeArgsIssue(args, error) {
        return makeIssue({
          data: args,
          path: ctx.path,
          errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            getErrorMap(),
            errorMap
          ].filter((x) => !!x),
          issueData: {
            code: ZodIssueCode.invalid_arguments,
            argumentsError: error
          }
        });
      }
      function makeReturnsIssue(returns, error) {
        return makeIssue({
          data: returns,
          path: ctx.path,
          errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            getErrorMap(),
            errorMap
          ].filter((x) => !!x),
          issueData: {
            code: ZodIssueCode.invalid_return_type,
            returnTypeError: error
          }
        });
      }
      const params = { errorMap: ctx.common.contextualErrorMap };
      const fn = ctx.data;
      if (this._def.returns instanceof ZodPromise) {
        return OK(async (...args) => {
          const error = new ZodError([]);
          const parsedArgs = await this._def.args.parseAsync(args, params).catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
          const result = await fn(...parsedArgs);
          const parsedReturns = await this._def.returns._def.type.parseAsync(result, params).catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
          return parsedReturns;
        });
      } else {
        return OK((...args) => {
          const parsedArgs = this._def.args.safeParse(args, params);
          if (!parsedArgs.success) {
            throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
          }
          const result = fn(...parsedArgs.data);
          const parsedReturns = this._def.returns.safeParse(result, params);
          if (!parsedReturns.success) {
            throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
          }
          return parsedReturns.data;
        });
      }
    }
    parameters() {
      return this._def.args;
    }
    returnType() {
      return this._def.returns;
    }
    args(...items) {
      return new ZodFunction({
        ...this._def,
        args: ZodTuple.create(items).rest(ZodUnknown.create())
      });
    }
    returns(returnType) {
      return new ZodFunction({
        ...this._def,
        returns: returnType
      });
    }
    implement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    strictImplement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    static create(args, returns, params) {
      return new ZodFunction({
        args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
        returns: returns || ZodUnknown.create(),
        typeName: ZodFirstPartyTypeKind.ZodFunction,
        ...processCreateParams(params)
      });
    }
  };
  var ZodLazy = class extends ZodType {
    get schema() {
      return this._def.getter();
    }
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const lazySchema = this._def.getter();
      return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
  };
  ZodLazy.create = (getter, params) => {
    return new ZodLazy({
      getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams(params)
    });
  };
  var ZodLiteral = class extends ZodType {
    _parse(input2) {
      if (input2.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return INVALID;
      }
      return { status: "valid", value: input2.data };
    }
    get value() {
      return this._def.value;
    }
  };
  ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
      value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams(params)
    });
  };
  function createZodEnum(values, params) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams(params)
    });
  }
  var ZodEnum = class extends ZodType {
    _parse(input2) {
      if (typeof input2.data !== "string") {
        const ctx = this._getOrReturnCtx(input2);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (this._def.values.indexOf(input2.data) === -1) {
        const ctx = this._getOrReturnCtx(input2);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input2.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Values() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
  };
  ZodEnum.create = createZodEnum;
  var ZodNativeEnum = class extends ZodType {
    _parse(input2) {
      const nativeEnumValues = util.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input2);
      if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (nativeEnumValues.indexOf(input2.data) === -1) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input2.data);
    }
    get enum() {
      return this._def.values;
    }
  };
  ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams(params)
    });
  };
  var ZodPromise = class extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
      return OK(promisified.then((data) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      }));
    }
  };
  ZodPromise.create = (schema, params) => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams(params)
    });
  };
  var ZodEffects = class extends ZodType {
    innerType() {
      return this._def.schema;
    }
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      const effect = this._def.effect || null;
      if (effect.type === "preprocess") {
        const processed = effect.transform(ctx.data);
        if (ctx.common.async) {
          return Promise.resolve(processed).then((processed2) => {
            return this._def.schema._parseAsync({
              data: processed2,
              path: ctx.path,
              parent: ctx
            });
          });
        } else {
          return this._def.schema._parseSync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      const checkCtx = {
        addIssue: (arg) => {
          addIssueToContext(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        }
      };
      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (effect.type === "refinement") {
        const executeRefinement = (acc) => {
          const result = effect.refinement(acc, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(result);
          }
          if (result instanceof Promise) {
            throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
          }
          return acc;
        };
        if (ctx.common.async === false) {
          const inner = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          executeRefinement(inner.value);
          return { status: status.value, value: inner.value };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
        }
      }
      if (effect.type === "transform") {
        if (ctx.common.async === false) {
          const base = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (!isValid(base))
            return base;
          const result = effect.transform(base.value, checkCtx);
          if (result instanceof Promise) {
            throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
          }
          return { status: status.value, value: result };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
            if (!isValid(base))
              return base;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
          });
        }
      }
      util.assertNever(effect);
    }
  };
  ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params)
    });
  };
  ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params)
    });
  };
  var ZodOptional = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType === ZodParsedType.undefined) {
        return OK(void 0);
      }
      return this._def.innerType._parse(input2);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodOptional.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  var ZodNullable = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType === ZodParsedType.null) {
        return OK(null);
      }
      return this._def.innerType._parse(input2);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodNullable.create = (type, params) => {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams(params)
    });
  };
  var ZodDefault = class extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      let data = ctx.data;
      if (ctx.parsedType === ZodParsedType.undefined) {
        data = this._def.defaultValue();
      }
      return this._def.innerType._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    removeDefault() {
      return this._def.innerType;
    }
  };
  ZodDefault.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  var ZodNaN = class extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return { status: "valid", value: input2.data };
    }
  };
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams(params)
    });
  };
  var BRAND = Symbol("zod_brand");
  var ZodBranded = class extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const data = ctx.data;
      return this._def.type._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    unwrap() {
      return this._def.type;
    }
  };
  var custom = (check, params = {}, fatal) => {
    if (check)
      return ZodAny.create().superRefine((data, ctx) => {
        if (!check(data)) {
          const p = typeof params === "function" ? params(data) : params;
          const p2 = typeof p === "string" ? { message: p } : p;
          ctx.addIssue({ code: "custom", ...p2, fatal });
        }
      });
    return ZodAny.create();
  };
  var late = {
    object: ZodObject.lazycreate
  };
  var ZodFirstPartyTypeKind;
  (function(ZodFirstPartyTypeKind2) {
    ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  var instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
  }) => custom((data) => data instanceof cls, params, true);
  var stringType = ZodString.create;
  var numberType = ZodNumber.create;
  var nanType = ZodNaN.create;
  var bigIntType = ZodBigInt.create;
  var booleanType = ZodBoolean.create;
  var dateType = ZodDate.create;
  var undefinedType = ZodUndefined.create;
  var nullType = ZodNull.create;
  var anyType = ZodAny.create;
  var unknownType = ZodUnknown.create;
  var neverType = ZodNever.create;
  var voidType = ZodVoid.create;
  var arrayType = ZodArray.create;
  var objectType = ZodObject.create;
  var strictObjectType = ZodObject.strictCreate;
  var unionType = ZodUnion.create;
  var discriminatedUnionType = ZodDiscriminatedUnion.create;
  var intersectionType = ZodIntersection.create;
  var tupleType = ZodTuple.create;
  var recordType = ZodRecord.create;
  var mapType = ZodMap.create;
  var setType = ZodSet.create;
  var functionType = ZodFunction.create;
  var lazyType = ZodLazy.create;
  var literalType = ZodLiteral.create;
  var enumType = ZodEnum.create;
  var nativeEnumType = ZodNativeEnum.create;
  var promiseType = ZodPromise.create;
  var effectsType = ZodEffects.create;
  var optionalType = ZodOptional.create;
  var nullableType = ZodNullable.create;
  var preprocessType = ZodEffects.createWithPreprocess;
  var ostring = () => stringType().optional();
  var onumber = () => numberType().optional();
  var oboolean = () => booleanType().optional();
  var NEVER = INVALID;
  var mod = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    getParsedType,
    ZodParsedType,
    defaultErrorMap: errorMap,
    setErrorMap,
    getErrorMap,
    makeIssue,
    EMPTY_PATH,
    addIssueToContext,
    ParseStatus,
    INVALID,
    DIRTY,
    OK,
    isAborted,
    isDirty,
    isValid,
    isAsync,
    ZodType,
    ZodString,
    ZodNumber,
    ZodBigInt,
    ZodBoolean,
    ZodDate,
    ZodUndefined,
    ZodNull,
    ZodAny,
    ZodUnknown,
    ZodNever,
    ZodVoid,
    ZodArray,
    get objectUtil() {
      return objectUtil;
    },
    ZodObject,
    ZodUnion,
    ZodDiscriminatedUnion,
    ZodIntersection,
    ZodTuple,
    ZodRecord,
    ZodMap,
    ZodSet,
    ZodFunction,
    ZodLazy,
    ZodLiteral,
    ZodEnum,
    ZodNativeEnum,
    ZodPromise,
    ZodEffects,
    ZodTransformer: ZodEffects,
    ZodOptional,
    ZodNullable,
    ZodDefault,
    ZodNaN,
    BRAND,
    ZodBranded,
    custom,
    Schema: ZodType,
    ZodSchema: ZodType,
    late,
    get ZodFirstPartyTypeKind() {
      return ZodFirstPartyTypeKind;
    },
    any: anyType,
    array: arrayType,
    bigint: bigIntType,
    boolean: booleanType,
    date: dateType,
    discriminatedUnion: discriminatedUnionType,
    effect: effectsType,
    "enum": enumType,
    "function": functionType,
    "instanceof": instanceOfType,
    intersection: intersectionType,
    lazy: lazyType,
    literal: literalType,
    map: mapType,
    nan: nanType,
    nativeEnum: nativeEnumType,
    never: neverType,
    "null": nullType,
    nullable: nullableType,
    number: numberType,
    object: objectType,
    oboolean,
    onumber,
    optional: optionalType,
    ostring,
    preprocess: preprocessType,
    promise: promiseType,
    record: recordType,
    set: setType,
    strictObject: strictObjectType,
    string: stringType,
    transformer: effectsType,
    tuple: tupleType,
    "undefined": undefinedType,
    union: unionType,
    unknown: unknownType,
    "void": voidType,
    NEVER,
    ZodIssueCode,
    quotelessJson,
    ZodError
  });

  // ts/timetable/timetable-class-color.ts
  var TimetableColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "pink"
  ];

  // ts/timetable/timetable-error.ts
  var TimetableError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "TimetableError";
    }
    static badDuration(durationMins) {
      return new TimetableError(
        `Duration of ${durationMins} minutes is not allowed`
      );
    }
    static blockBadStartTime(time) {
      return new TimetableError(
        `A block start time of "${time.toString(true)}" is not allowed`
      );
    }
    static optionNoBlocks() {
      return new TimetableError(
        `An option cannot have no time blocks`
      );
    }
    static optionDuplicateBlocks() {
      return new TimetableError(
        `An option cannot have duplicate time blocks`
      );
    }
    static classNoOptions() {
      return new TimetableError(
        `A class cannot have no timeslot options`
      );
    }
    static classDuplicateOptions() {
      return new TimetableError(
        `A class cannot have duplicate options`
      );
    }
    static timetableDuplicateClasses() {
      return new TimetableError(
        `A timetable cannot have duplicate classes`
      );
    }
    static badBlockString(val) {
      return new TimetableError(
        `"${val}" is not a valid time block`
      );
    }
    static classesChoicesMismatch() {
      return new TimetableError(
        `The classes in the choices array do not match the classes in the timetable`
      );
    }
    static duplicatedClassInChoices() {
      return new TimetableError(
        `The choices array provided had the same class twice`
      );
    }
    static optionMissing() {
      return new TimetableError(
        `The chosen option doesn't exist for this class`
      );
    }
    static badChoiceArrayLength() {
      return new TimetableError(
        ` The number of choices in the array must match the number of classes`
      );
    }
    static badChoiceIndex(index) {
      return new TimetableError(
        `The choice index "${index}" was out of range for this class`
      );
    }
  };

  // ts/timetable/timetable-block.ts
  var TimetableBlock = class {
    constructor(dayOfWeek, startTime, durationMins, online) {
      if (startTime.isNextDay) {
        throw TimetableError.blockBadStartTime(startTime);
      }
      if (!Number.isInteger(durationMins) || durationMins < 1 || durationMins > 24 * 60) {
        throw TimetableError.badDuration(durationMins);
      }
      this.dayOfWeek = dayOfWeek;
      this.startTime = startTime;
      this.durationMins = durationMins;
      this.online = online;
    }
    get endTime() {
      return new LocalTime(this.startTime.minuteOfDay + this.durationMins);
    }
    equals(other) {
      return this.dayOfWeek.equals(other.dayOfWeek) && this.startTime.equals(other.startTime) && this.durationMins === other.durationMins && this.online === other.online;
    }
    static tryFromString(value) {
      const bits = value.trim().split(" ").filter((s) => s.length != 0);
      if (bits.length != 3 && bits.length != 4) {
        return null;
      }
      const dayOfWeek = DayOfWeek.tryFromCodeName(bits[0]);
      if (dayOfWeek == null) {
        return null;
      }
      const startTime = LocalTime.tryParse(bits[1]);
      if (startTime == null) {
        return null;
      }
      const durationStr = bits[2];
      const durationNum = parseIntNull(durationStr.substring(0, durationStr.length - 1));
      if (durationNum == null) {
        return null;
      }
      const durationMins = durationStr.endsWith("h") ? durationNum * 60 : durationNum;
      let online = false;
      if (bits.length == 4) {
        if (bits[3] != "online") {
          return null;
        }
        online = true;
      }
      return new TimetableBlock(dayOfWeek, startTime, durationMins, online);
    }
    static fromString(value) {
      const block = TimetableBlock.tryFromString(value);
      if (block == null) {
        throw TimetableError.badBlockString(value);
      }
      return block;
    }
    static isValidString(value) {
      return this.tryFromString(value) != null;
    }
    toString() {
      const dow = this.dayOfWeek.codeName;
      const time = this.startTime.toString(false);
      const duration = this.durationMins % 60 == 0 ? `${this.durationMins / 60}h` : `${this.durationMins}m`;
      return this.online ? `${dow} ${time} ${duration} online` : `${dow} ${time} ${duration}`;
    }
    toDisplayString() {
      const dow = this.dayOfWeek.name.substring(0, 3);
      const onlineSuffix = this.online ? " online" : "";
      return `${dow} ${this.startTime.to12HString()}${onlineSuffix}`;
    }
  };

  // ts/timetable/timetable-option.ts
  var _TimetableOption = class {
    constructor(blocks) {
      if (blocks.length < 1) {
        throw TimetableError.optionNoBlocks();
      }
      if (!areUnique(blocks, (a, b) => a.equals(b))) {
        throw TimetableError.optionDuplicateBlocks();
      }
      this.blocks = blocks;
    }
    equals(other) {
      return arraysMatch(this.blocks, other.blocks, (a, b) => a.equals(b));
    }
    toJSON() {
      return this.blocks.length == 1 ? this.blocks[0].toString() : this.blocks.map((b) => b.toString());
    }
    toDisplayString() {
      return this.blocks.map((b) => b.toDisplayString()).join(" & ");
    }
    hasWeekendBlocks(daySplitTime) {
      return this.blocks.some((b) => b.dayOfWeek.isWeekend || b.dayOfWeek.equals(DayOfWeek.fri) && b.endTime.isAfter(daySplitTime));
    }
    earliestStartTime() {
      return LocalTime.earliest(...this.blocks.map((x) => x.startTime));
    }
    latestEndTime() {
      return LocalTime.latest(...this.blocks.map((x) => x.endTime));
    }
  };
  var TimetableOption = _TimetableOption;
  TimetableOption.json = mod.union([
    mod.string().refine((s) => TimetableBlock.isValidString(s)).transform((s) => [TimetableBlock.fromString(s)]),
    mod.string().refine((s) => TimetableBlock.isValidString(s)).transform((s) => TimetableBlock.fromString(s)).array().min(1)
  ]).transform(
    (x) => new _TimetableOption(x)
  );
  TimetableOption.rawJson = mod.union([
    mod.string(),
    mod.string().array()
  ]);

  // ts/timetable/timetable-class.ts
  var _TimetableClass = class {
    constructor(name, title, color, options, optional) {
      if (options.length < 1) {
        throw TimetableError.classNoOptions();
      }
      if (!areUnique(options, (a, b) => a.equals(b))) {
        throw TimetableError.classDuplicateOptions();
      }
      this.name = name;
      this.type = title;
      this.color = color;
      this.options = options;
      this.optional = optional;
    }
    equals(other) {
      return this.name === other.name && this.type === other.type && this.color === other.color && arraysMatch(this.options, other.options) && this.optional === other.optional;
    }
    toJSON() {
      return {
        name: this.name,
        type: this.type,
        color: this.color,
        options: this.options.map((o) => o.toJSON()),
        optional: this.optional ? true : void 0
      };
    }
    hasWeekendOptions(daySplitTime) {
      return this.options.some((c) => c.hasWeekendBlocks(daySplitTime));
    }
    earliestStartTime() {
      return LocalTime.earliest(...this.options.map((o) => o.earliestStartTime()));
    }
    latestEndTime() {
      return LocalTime.latest(...this.options.map((o) => o.latestEndTime()));
    }
  };
  var TimetableClass = _TimetableClass;
  TimetableClass.json = mod.object({
    name: mod.string(),
    type: mod.string(),
    color: mod.enum(TimetableColors),
    options: TimetableOption.json.array().min(1),
    optional: mod.boolean().optional()
  }).transform(
    (x) => {
      var _a;
      return new _TimetableClass(x.name, x.type, x.color, x.options, (_a = x.optional) != null ? _a : false);
    }
  );
  TimetableClass.rawJson = mod.object({
    name: mod.string(),
    type: mod.string(),
    color: mod.enum(TimetableColors),
    options: TimetableOption.rawJson.array(),
    optional: mod.boolean().optional()
  });

  // ts/timetable/timetable.ts
  var version = "2";
  var _Timetable = class {
    constructor(classes) {
      if (!areUnique(classes, (a, b) => a.equals(b))) {
        throw TimetableError.timetableDuplicateClasses();
      }
      this.classes = classes;
    }
    equals(other) {
      return arraysMatch(this.classes, other.classes);
    }
    toJSON() {
      return {
        $schema: "https://timetabler.danschellekens.com/schema-v2.json",
        version: "2",
        classes: this.classes.map((c) => c.toJSON())
      };
    }
    hasWeekendOptions(daySplitTime) {
      return this.classes.some((c) => c.hasWeekendOptions(daySplitTime));
    }
    earliestStartTime() {
      return LocalTime.earliest(...this.classes.map((c) => c.earliestStartTime()));
    }
    latestEndTime() {
      return LocalTime.latest(...this.classes.map((c) => c.latestEndTime()));
    }
  };
  var Timetable = _Timetable;
  Timetable.json = mod.object({
    version: mod.string().refine((s) => s == version),
    classes: TimetableClass.json.array()
  }).transform(
    (x) => new _Timetable(x.classes)
  );
  Timetable.rawJson = mod.object({
    $schema: mod.string(),
    version: mod.string(),
    classes: TimetableClass.rawJson.array()
  });

  // ts/timetable/timetable-choices.ts
  var _TimetableChoices = class {
    constructor(timetable2, choices) {
      if (!arraysMatch(choices.map((c) => c.timetableClass), timetable2.classes)) {
        throw TimetableError.classesChoicesMismatch();
      }
      if (!areUnique(choices.map((c) => c.timetableClass), (a, b) => a.equals(b))) {
        throw TimetableError.duplicatedClassInChoices();
      }
      this.timetable = timetable2;
      this.choices = choices;
    }
    static fromIndices(timetable2, indices) {
      if (indices == null) {
        return new _TimetableChoices(
          timetable2,
          timetable2.classes.map((c) => new TimetableChoice(c, null))
        );
      }
      if (indices.length != timetable2.classes.length) {
        throw TimetableError.badChoiceArrayLength();
      }
      return new _TimetableChoices(
        timetable2,
        timetable2.classes.map((c, i) => TimetableChoice.fromIndex(c, indices[i]))
      );
    }
    toJSON() {
      let choices = void 0;
      if (this.choices.some((c) => c.option != null)) {
        choices = this.timetable.classes.map((cl) => {
          const choice = this.choices.find((ch) => ch.timetableClass == cl);
          if (choice == null) {
            throw new Error();
          }
          const option = choice.option;
          if (option == null) {
            return null;
          }
          const optionIndex = cl.options.findIndex((o) => o.equals(option));
          return optionIndex;
        });
      }
      return __spreadProps(__spreadValues({}, this.timetable.toJSON()), {
        choices
      });
    }
    withChoice(timetableClass, option) {
      const choices = this.choices.map((ch) => {
        if (ch.timetableClass == timetableClass) {
          return new TimetableChoice(timetableClass, option);
        }
        return ch;
      });
      return new _TimetableChoices(this.timetable, choices);
    }
  };
  var TimetableChoices = _TimetableChoices;
  TimetableChoices.json = mod.object({
    version: mod.string().refine((s) => s == version),
    classes: TimetableClass.json.array(),
    choices: mod.union([mod.number().int(), mod.null()]).array().optional()
  }).transform(
    (x) => {
      var _a;
      return _TimetableChoices.fromIndices(new Timetable(x.classes), (_a = x.choices) != null ? _a : null);
    }
  );
  TimetableChoices.rawJson = mod.object({
    $schema: mod.string(),
    version: mod.string(),
    classes: TimetableClass.rawJson.array(),
    choices: mod.union([mod.number(), mod.null()]).array().optional()
  });
  var TimetableChoice = class {
    constructor(timetableClass, option) {
      if (option != null && !timetableClass.options.some((o) => o.equals(option))) {
        throw TimetableError.optionMissing();
      }
      this.timetableClass = timetableClass;
      this.option = option;
    }
    static fromIndex(timetableClass, index) {
      if (index == null) {
        return new TimetableChoice(timetableClass, null);
      }
      if (!Number.isInteger(index) || index < 0 || index >= timetableClass.options.length) {
        throw TimetableError.badChoiceIndex(index);
      }
      return new TimetableChoice(timetableClass, timetableClass.options[index]);
    }
  };

  // ts/main.ts
  var html = {
    controls: finder.any("controls"),
    canvasContainer: finder.div("canvas-container"),
    canvas: finder.canvas("canvas"),
    mobileExpanderButton: finder.button("mobile-expander-button"),
    importButton: finder.button("import-button"),
    exportButton: finder.button("export-button"),
    classes: finder.div("classes")
  };
  var controls = new ControlsController(html);
  var timetable = new TimetableChoices(new Timetable([]), []);
  var canvas2 = new CanvasController(html);
  canvas2.fitCanvas();
  window.addEventListener("resize", () => canvas2.fitCanvas());
  html.mobileExpanderButton.addEventListener("click", () => {
    html.controls.classList.toggle("collapsed");
  });
  html.importButton.addEventListener("click", () => {
    openFileDialog(".json", (file) => {
      const newTimetable = (() => {
        try {
          const json = JSON.parse(file);
          return TimetableChoices.json.parse(json);
        } catch (err) {
          alert("That .json file was invalid.");
          console.warn(err);
          return null;
        }
      })();
      if (newTimetable != null) {
        updateTimetable(newTimetable);
      }
    });
  });
  html.exportButton.addEventListener("click", () => {
    const text = JSON.stringify(timetable.toJSON());
    download(text, "timetable.json");
  });
  function updateTimetable(newTimetable) {
    timetable = newTimetable;
    controls.onTimetableUpdate(timetable);
    canvas2.onTimetableUpdate(timetable);
  }
  function getCurrentTimetable() {
    return timetable;
  }
})();
//# sourceMappingURL=main.js.map
