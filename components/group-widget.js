import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "group";
    
    this.listeners = [];
    this.valuesByAttribute = {};
    
    this.attributeSelect = this.get("#attributeSelect");
    this.applyButton = this.get("#applyButton");
    
    this.applyButton.addEventListener("click", () => {
      this._applyGrouping();
    });
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setData(data) {
    this._setValuesByAttributes(data);
  }
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _setValuesByAttributes(valuesByAttributes) {
    this.valuesByAttribute = valuesByAttributes;
    this._setGroupAttributes(Object.keys(valuesByAttributes));
  }
  
  _applyGrouping() {
    this.listeners.forEach( (listener) => {
      listener.applyAction(this);
    });
  }
  
  _setGroupAttributes(attributes) {
    this._clearSelectOptions(this.attributeSelect);
    attributes.forEach( (attribute) => {
      this.attributeSelect.appendChild(new Option(attribute));
    });
  }
  
  _getSelectedGroupAttribute() {
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value
  }
  
  _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0);
    }
  }
}