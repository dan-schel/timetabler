import {
  ifDefined, withDefined, DynamicCollection, ElementAttributes, ElementTree
} from "./make";

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<svg>`s.
 */
export type SVGAttributes = {
  id?: string;
  classes?: DynamicCollection<string>;
  width?: number;
  height?: number;
  viewBox?: string;
  preserveAspectRatio?: string;
  innerHTML?: string;
};

/**
 * Creates an `<svg>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function svg(attributes: SVGAttributes): ElementTree<SVGSVGElement, unknown> {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ifDefined(attributes.id, x => element.id = x);
  withDefined(attributes.classes, x => element.classList.add(...x));

  ifDefined(attributes.width, x => element.setAttribute("width", x.toFixed()));
  ifDefined(attributes.height, x => element.setAttribute("height", x.toFixed()));
  ifDefined(attributes.viewBox, x => element.setAttribute("viewBox", x));
  ifDefined(attributes.preserveAspectRatio,
    x => element.setAttribute("preserveAspectRatio", x)
  );

  ifDefined(attributes?.innerHTML, x => element.innerHTML = x);

  return { $element: element };
}

/**
 * Contains the instructions for creating each icon in the set used by this
 * application.
 */
export type IconLibrary = Record<string, { viewBox: string; data: string }>;

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<svg class="icon">`s.
 */
export type IconAttributes = ElementAttributes;

/**
 * Creates an `<svg class="icon">`.
 * @param icon The ID of the index to use from the library.
 * @param library The instructions for creating each icon in the set.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function icon<K extends IconLibrary, S extends keyof K>(icon: S,
  library: K, attributes: IconAttributes) {

  const iconData = library[icon];
  const dom = svg({
    viewBox: iconData.viewBox,
    preserveAspectRatio: "xMidYMid meet",
    innerHTML: iconData.data,
    ...attributes
  });
  dom.$element.classList.add("icon");
  return dom;
}
