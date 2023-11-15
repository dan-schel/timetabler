/** An array which may have undefined element. For use with {@link maybe}. */
export type DynamicCollection<T> = (T | undefined)[];

/** An element and it's children, forming a tree. */
export type ElementTree<T extends Element, K> = K & { $element: T; };

/**
 * A object containing named element trees for an element's children, or named
 * arrays of element trees.
 */
export type ElementCollection = Record<string,
  ElementTree<Element, unknown> | ElementTree<Element, unknown>[]
>;

/**
 * Returns {@link ifTrue} if {@link condition} is true, and {@link ifFalse}
 * (usually undefined) otherwise.
 * @param condition The condition.
 * @param ifTrue Value used if the condition is true.
 * @param ifFalse Value used if the condition is false.
 */
export function maybe<T>(condition: boolean, ifTrue: T, ifFalse?: T): T | undefined {
  return condition ? ifTrue : ifFalse;
}

/**
 * Returns the non-null elements from the array, or an empty array if the array
 * is undefined.
 * @param array The array.
 */
export function retrieve<T>(array: DynamicCollection<T> | undefined): T[] {
  if (array == null) { return []; }
  return array.filter(x => x != null) as T[];
}

/**
 * Runs {@link func} with the {@link value} if it's not undefined.
 * @param value The value.
 * @param func The function to run.
 */
export function ifDefined<T>(value: T | undefined, func: (value: T) => void) {
  if (value !== undefined) {
    func(value);
  }
}

/**
 * Runs {@link func} with the non-undefined elements of the {@link array}, if
 * there are any.
 * @param array The array.
 * @param func The function to run.
 */
export function withDefined<T>(array: DynamicCollection<T> | undefined,
  func: (value: T[]) => void) {

  const actuals = retrieve(array);
  if (actuals.length > 0) {
    func(actuals);
  }
}

/**
 * Creates an array of element from an {@link array} and {@link builder}
 * function.
 * @param array The array (may contain `undefined`s).
 * @param builder The function to transform to values to elements.
 */
export function elementArray<T, K>(array: DynamicCollection<T>,
  builder: (value: T) => K): K[] {
  return retrieve(array).map(x => builder(x));
}

/** The possible configuration for a HTMLElement. */
export type ElementAttributes = {
  id?: string;
  classes?: DynamicCollection<string>;
}

/**
 * Constructs a html element with the given tag and configures it with the given
 * attributes. Appends each child to element if provided, and passes them
 * through into the returned object.
 * @param tag The html tag, e.g. "p" for paragraph.
 * @param attributes The attributes to configure the element with.
 * @param children The children to append and return.
 */
export function element<
  Tag extends keyof HTMLElementTagNameMap, Children extends ElementCollection
>(
  tag: Tag,
  attributes: ElementAttributes,
  children: Children
): ElementTree<HTMLElementTagNameMap[Tag], Children> {

  const element = document.createElement(tag);

  // Set the element ID if provided.
  ifDefined(attributes.id, x => element.id = x);

  // Add each class provided.
  withDefined(attributes.classes, x => element.classList.add(...x));

  // Add each child element provided.
  if (children != null) {
    element.replaceChildren(...getChildrenArray(children));
  }

  // Return this element, as well as any children.
  return {
    $element: element,
    ...children
  };
}

/**
 * Returns true if {@link value} is an {@link ElementTree}.
 * @param value The value to test.
 */
function isElementTree(value: unknown): value is ElementTree<Element, unknown> {
  return value != null && typeof value === "object" && "$element" in value;
}

/**
 * Returns every child element in the top-level (or array in the top-level) of
 * the given element collection.
 * @param collection The element collection.
 */
export function getChildrenArray(collection: ElementCollection): Element[] {
  return Object.keys(collection)
    .filter(k => k != "$element")
    .filter(k => collection[k] != null)
    .map(k => {
      const value = collection[k];
      if (isElementTree(value)) { return [value.$element]; }
      else { return value.map(x => x.$element); }
    })
    .flat();
}

/**
 * Returns every child element in the the given element collection, including
 * nested children.
 * @param collection The element collection.
 */
export function getChildrenArrayRecursive(collection: ElementCollection): Element[] {
  return Object.keys(collection)
    .filter(k => k != "$element")
    .filter(k => collection[k] != null)
    .map(k => {
      const value = collection[k];
      const inner = getChildrenArrayRecursive(value as unknown as ElementCollection);
      if (isElementTree(value)) { return [value.$element, ...inner]; }
      else { return [...value.map(x => x.$element), ...inner]; }
    })
    .flat();
}
