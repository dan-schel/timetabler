import { ifDefined, element, ElementAttributes, ElementCollection } from "./make";

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * text elements.
 */
export type TextAttributes = ElementAttributes & {
  text?: string
};

/**
 * Creates a `<p>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function p<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("p", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<span>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function span<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("span", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h1>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h1<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h1", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h2>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h2<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h2", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h3>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h3<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h3", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h4>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h4<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h4", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h5>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h5<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h5", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}

/**
 * Creates a `<h6>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function h6<K extends ElementCollection>(
  attributes: TextAttributes, children: K) {

  const dom = element("h6", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  return dom;
}
