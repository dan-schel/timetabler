import { div } from "./div";
import {
  ifDefined,
  DynamicCollection, ElementAttributes, ElementCollection,
  getChildrenArrayRecursive
} from "./make";
import { checkbox, label, radio, select as formSelect } from "./form";
import { uuid } from "schel-d-utils";

/**
 * The possible configuration for a `schel-d/css-template` compatible select
 * structure.
 */
export type SelectAttributes = {
  wrapperID?: string;
  wrapperClasses?: DynamicCollection<string>;
  selectID?: string;
  selectName?: string;
  autocomplete?: string;
  highlightClass?: string;
  arrowClass?: string;
};

/**
 * Creates a `schel-d/css-template` compatible select structure.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param innerSelectChildren Children to append to the inner select element
 * (the options) and return.
 */
export function select<K extends ElementCollection>(
  attributes: SelectAttributes, innerSelectChildren: K) {

  const highlightClass = attributes.highlightClass ?? "select-highlight";
  const arrowClass = attributes.arrowClass ?? "select-arrow";

  return div({ id: attributes.wrapperID, classes: attributes.wrapperClasses }, {
    select: formSelect({
      id: attributes.selectID,
      autocomplete: attributes.autocomplete,
      name: attributes.selectName
    }, innerSelectChildren),
    highlight: div({ classes: [highlightClass] }, {
      arrow: div({ classes: [arrowClass] }, {})
    })
  });
}

/**
 * The possible configuration for the group div that forms part of a
 * `schel-d/css-template` compatible picker structure.
 */
export type PickerGroupAttributes = ElementAttributes & {
  radioName?: string;
  autocomplete?: string;
}

/**
 * Creates the parent div for a `schel-d/css-template` compatible picker
 * structure.
 * @param attributes Attributes to apply to the element, e.g. classes.
 */
export function pickerGroup<K extends ElementCollection>(
  attributes: PickerGroupAttributes, children: K) {

  // Apply the radio name to any inner radio buttons. Use a random radio name
  // if none provided.
  const radioName = attributes.radioName ?? uuid();
  getChildrenArrayRecursive(children)
    .filter(x => x instanceof HTMLInputElement && x.type == "radio")
    .forEach(x => {
      const radio = x as HTMLInputElement;
      radio.name = radioName;
      ifDefined(attributes.autocomplete, x => radio.autocomplete = x);
    });

  return div(attributes, children);
}

/**
 * The possible configuration for a button that forms part of a
 * `schel-d/css-template` compatible picker structure.
 */
export type PickerButtonAttributes = {
  labelClass?: string;
  contentClass?: string;
  radioID?: string;
};

/**
 * Creates a button in a `schel-d/css-template` compatible picker structure.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param innerChildren Children to append to the content div inside the picker
 * button.
 */
export function pickerButton<K extends ElementCollection>(
  attributes: PickerButtonAttributes, innerChildren: K) {

  const contentClass = attributes.contentClass ?? "picker-content";

  return label({ classes: [attributes.labelClass] }, {
    radio: radio({ id: attributes.radioID }),
    content: div({ classes: [contentClass] }, innerChildren)
  });
}

/**
 * The possible configuration for a button that forms part of a
 * `schel-d/css-template` compatible picker structure.
 */
export type SwitchAttributes = {
  wrapperID?: string;
  wrapperClasses?: DynamicCollection<string>;
  checkboxID?: string;
  autocomplete?: string;
  graphicClass?: string;
  contentClass?: string;
};

/**
 * Creates a `schel-d/css-template` compatible switch structure.
 * @param attributes Attributes to apply to the element, e.g. classes.
 * @param innerChildren Children to append to the content div inside the switch.
 */
export function switchCheckbox<K extends ElementCollection>(
  attributes: SwitchAttributes, innerChildren: K) {

  const contentClass = attributes.contentClass ?? "switch-content";
  const graphicClass = attributes.graphicClass ?? "switch-graphic";

  return label({
    id: attributes.wrapperID,
    classes: attributes.wrapperClasses
  }, {
    checkbox: checkbox({
      id: attributes.checkboxID,
      autocomplete: attributes.autocomplete
    }),
    visuals: div({}, {
      graphic: div({ classes: [graphicClass] }, {}),
      content: div({ classes: [contentClass] }, innerChildren)
    })
  });
}
