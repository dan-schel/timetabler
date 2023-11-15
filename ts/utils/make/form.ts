import { ifDefined, element, ElementAttributes, ElementCollection } from "./make";

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<form>`s.
 */
export type FormAttributes = ElementAttributes & {
  action: string;
  method: string;
  autocomplete?: string;
};

/**
 * Creates an `<form>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function form<K extends ElementCollection>(attributes: FormAttributes,
  children: K) {

  const dom = element("form", attributes, children);
  ifDefined(attributes.action, x => dom.$element.action = x);
  ifDefined(attributes.method, x => dom.$element.method = x);
  ifDefined(attributes.autocomplete, x => dom.$element.autocomplete = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<input>`s.
 */
export type InputAttributes = ElementAttributes & {
  type?: string;
  value?: string;
  name?: string;
  autocomplete?: string;
};

/**
 * Creates an `<input>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function input(attributes: InputAttributes) {
  const dom = element("input", attributes, {});
  ifDefined(attributes.type, x => dom.$element.type = x);
  ifDefined(attributes.value, x => dom.$element.value = x);
  ifDefined(attributes.name, x => dom.$element.name = x);
  ifDefined(attributes.autocomplete, x => dom.$element.autocomplete = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<input type="radio">`s.
 */
export type TextboxAttributes = Omit<InputAttributes, "type"> & {
  placeholder: string;
};

/**
 * Creates an `<input type="text">`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function textbox(attributes: TextboxAttributes) {
  const dom = input({ type: "text", ...attributes });
  ifDefined(attributes.placeholder, x => dom.$element.placeholder = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<input type="radio">`s.
 */
export type RadioAttributes = Omit<InputAttributes, "type"> & {
  checked?: boolean;
};

/**
 * Creates an `<input type="radio">`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function radio(attributes: RadioAttributes) {
  const dom = input({ type: "radio", ...attributes });
  ifDefined(attributes.checked, x => dom.$element.checked = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<input type="checkbox">`s.
 */
export type CheckboxAttributes = Omit<InputAttributes, "type"> & {
  checked?: boolean;
};

/**
 * Creates an `<input type="checkbox">`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function checkbox(attributes: CheckboxAttributes) {
  const dom = input({ type: "checkbox", ...attributes });
  ifDefined(attributes.checked, x => dom.$element.checked = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<select>`s.
 */
export type SelectAttributes = ElementAttributes & {
  name?: string;
  autocomplete?: string;
};

/**
 * Creates a `<select>`.
 * @param attributes Attributes to apply to the element, e.g. text.
 * @param children Children to append to the element and return.
 */
export function select<K extends ElementCollection>(
  attributes: SelectAttributes, children: K) {

  const dom = element("select", attributes, children);
  ifDefined(attributes.name, x => dom.$element.name = x);
  ifDefined(attributes.autocomplete, x => dom.$element.autocomplete = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<option>`s.
 */
export type OptionAttributes = ElementAttributes & {
  text?: string;
  value?: string;
  selected?: boolean;
};

/**
 * Creates an `<option>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function option(attributes: OptionAttributes) {
  const dom = element("option", attributes, {});
  ifDefined(attributes.text, x => dom.$element.text = x);
  ifDefined(attributes.value, x => dom.$element.value = x);
  ifDefined(attributes.selected, x => dom.$element.selected = x);
  return dom;
}

/**
 * Identical to {@link ElementAttributes}, but with additional values for
 * `<label>`s.
 */
export type LabelAttributes = ElementAttributes & {
  text?: string;
  for?: string;
};

/**
 * Creates a `<label>`.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param children Children to append to the element and return.
 */
export function label<K extends ElementCollection>(attributes: LabelAttributes,
  children: K) {

  const dom = element("label", attributes, children);
  ifDefined(attributes.text, x => dom.$element.textContent = x);
  ifDefined(attributes.for, x => dom.$element.htmlFor = x);
  return dom;
}
