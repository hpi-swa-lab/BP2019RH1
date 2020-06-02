"enable aexpr";

import GroupWidget from "./bp2019-group-widget.js"

export default class Bp2019YAxisGroupWidget extends GroupWidget {
  async initialize() {
    await super.initialize()
  }
  
  initializeWithData(attributes) {
    let themeString = "themes"
    if (attributes.includes(themeString)) {
      attributes.splice(attributes.indexOf(themeString), 1)
    }
    this._setSelectionOptions(attributes);
    this.attributeSelect.appendChild(new Option("amount"));
  }
}