import { element, ElementAttributes, ElementCollection } from "./make";

/**
 * Creates a `<div>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function div<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("div", attributes, children);
}

/**
 * Creates a `<section>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function section<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("section", attributes, children);
}

/**
 * Creates a `<main>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function main<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("main", attributes, children);
}

/**
 * Creates a `<header>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function header<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("header", attributes, children);
}

/**
 * Creates a `<footer>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function footer<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("footer", attributes, children);
}

/**
 * Creates a `<nav>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function nav<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("nav", attributes, children);
}

/**
 * Creates an `<aside>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function aside<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("aside", attributes, children);
}

/**
 * Creates a `<dialog>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function dialog<K extends ElementCollection>(
  attributes: ElementAttributes, children: K) {
  return element("dialog", attributes, children);
}
