import { make } from "schel-d-utils-browser";
import { icons } from "./icons";
import { TimetableClass } from "./timetable/timetable-class";

export function createClassUIDom(classData: TimetableClass) {
  // Append "OPTIONAL" to the subtitle for optional classes.
  const typeText = classData.optional
    ? `${classData.type.toUpperCase()} - OPTIONAL`
    : classData.type.toUpperCase();

  // Create the picker button for each option (and map it with it's option for
  // the controller's use).
  const options = classData.options.map(o => {
    const dom = make.cssTemplate.pickerButton({ labelClass: "option" }, {
      ol: make.div({ classes: ["one-line"] }, {
        text: make.p({ "text": o.toDisplayString() }, {})
      })
    });
    return { option: o, dom: dom };
  });

  // Create the menu (the button, edit/delete dropdown, and delete confirmation
  // dropdown).
  const menu = make.div({ classes: ["dropdown-container"] }, {
    // Open menu button.
    menuButton: make.button({
      classes: ["dropdown-button"], title: "More options"
    }, {
      icon: make.icon("uil:ellipsis-v", icons, {})
    }),

    // The edit/delete dropdown.
    menuDropdown: make.div({ classes: ["dropdown", "menu-dropdown"] }, {
      background: make.div({ classes: ["dropdown-background"] }, {}),
      content: make.div({ classes: ["dropdown-content"] }, {
        editButton: make.button({}, {
          text: make.p({ text: "Edit" }, {})
        }),
        deleteButton: make.button({}, {
          text: make.p({ text: "Delete" }, {})
        })
      })
    }),

    // The delete confirmation dropdown.
    deleteDropdown: make.div({ classes: ["dropdown", "delete-dropdown"] }, {
      background: make.div({ classes: ["dropdown-background"] }, {}),
      content: make.div({ classes: ["dropdown-content"] }, {
        message: make.p({ text: "Are you sure?" }, {}),
        deleteButton: make.button({}, {
          text: make.p({ text: "Delete" }, {})
        })
      })
    })
  });

  const dom = make.div({ classes: ["class"] }, {
    // Row with the title/subtitle and the menu button.
    nameRow: make.div({ classes: ["name-row"] }, {
      namesStack: make.div({ classes: ["names-stack"] }, {
        title: make.div({ classes: ["one-line"] }, {
          text: make.h3({ text: classData.name }, {})
        }),
        subtitle: make.div({ classes: ["one-line"] }, {
          text: make.h4({ text: typeText }, {})
        }),
      }),
      menu: menu
    }),

    // The option picker (including a button for "None").
    options: make.cssTemplate.pickerGroup({
      classes: ["options", `accent-${classData.color}`],
      autocomplete: "off"
    }, {
      noChoice: make.cssTemplate.pickerButton({ labelClass: "option" }, {
        ol: make.div({ classes: ["one-line"] }, {
          text: make.p({ "text": "None" }, {})
        })
      }),
      choices: options.map(o => o.dom)
    })
  });

  return { dom: dom, options: options };
}
