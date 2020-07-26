"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { GroupAction } from '../src/internal/individuals-as-points/common/actions.js'

export default class Bp2019YAxisGroupWidget extends Morph {
  async initialize() {
    this.name = "group";
    this.isGlobal = false;
    this.axis = "x";
    
    this.listeners = [];
    this.valuesByAttribute = {};
    
    this.attributeSelect = this.get("#attributeSelect");
    this.attributeSelect.addEventListener("change", () => {
      this._applyGrouping()
    })
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  initializeWithData(attributes) {
    let themeString = "themes"
    if (attributes.includes(themeString)) {
      attributes.splice(attributes.indexOf(themeString), 1)
    }
    this._setSelectionOptions(attributes);
    this.attributeSelect.appendChild(new Option("amount"));
  }
   
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  
  _setSelectionOptions(attributes) {
    this._clearSelectOptions(this.attributeSelect);
    this.attributeSelect.appendChild(new Option("none"))
    attributes.forEach(attribute => {
      this.attributeSelect.appendChild(new Option(attribute));
    });
  }
  
   _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0);
    }
  }
  
  _applyGrouping() {
    let groupAction = this._createGroupAction();
    this.listeners.forEach(listener => {
      listener.applyAction(groupAction);
    });
  }
  
  _createGroupAction(){
    let selectedGroupingAttribute = this._getSelectedGroupAttribute();
    return new GroupAction(selectedGroupingAttribute, this.isGlobal, this.axis, ["themes"]);
  }
  
  _getSelectedGroupAttribute() {
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value
  }
}