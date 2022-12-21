import { make } from "schel-d-utils-browser";
import { icons } from "./icons";

export function createEditOptionDom() {
  const dom = make.div({ classes: ["option"] }, {
    blocks: make.div({ classes: ["blocks"] }, {}),
    addBlockButton: make.button({
      classes: ["add-block-button"],
      title: "Add another block to this option"
    }, {
      icon: make.icon("uil:plus", icons, {})
    }),
    blockEditor: createBlockEditor()
  });

  return dom;
}

function createBlockEditor() {
  const dom = make.div({ classes: ["block-editor"] }, {

  });

  return dom;
}
