import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'

import { ColorAction } from "../src/internal/individuals-as-points/common/actions.js"

export default class FilterWidget extends Morph {
  async initialize() {
    this.listeners = [];
    this.name = "color"
    this.get('#is-global').checked = true
    
    this.currentAttribute = "";
    
    this.attributeSelect = this.get('#color-attribute-select')
    this.attributeSelect.addEventListener("change", () => this._applySelectedAttribute())
    
    this.valueSelectContainer = this.get('#color-values-select-container');
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  initializeWithData(data) {
    if (data.includes("themes")) {
      data.splice(data.indexOf("themes"), 1)
    }
    this._updateAttributeSelect(data);
  }
  
  setColorForValue(color, value) {
    this.currentColorsByValue[value] = color
    this._applySelectedValues()
  }
  
  setStateFromAction(colorAction) {
    this.currentAttribute = colorAction.attribute
    this.attributeSelect.value = this.currentAttribute
    this.currentColorsByValue = this.colorStore.getColorValuesForAttribute(this.currentAttribute);
    this._createColorValueSelects()
  }
  
  loadState(state) {
    // hello world
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _updateAttributeSelect(attributes) {
    this._clearSelectOptions(this.attributeSelect)
    this.attributeSelect.options[0] = new Option("none")
    attributes.forEach(attribute => {
      this.attributeSelect.options[this.attributeSelect.options.length] = new Option(attribute)
    })
  }
  
  _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0)
    }
  }
  
  _applySelectedAttribute(){
    this.currentAttribute = this.attributeSelect.value;
    
    if (this.currentAttribute !== "none") {
      this.currentColorsByValue = this.colorStore.getColorValuesForAttribute(this.currentAttribute);
      this._createColorValueSelects();
    } else {
      this._clearCurrentColorValueSelects()
    }
    
    this._applyColoringChangedAction();
  }
  
  _createColorValueSelects() {
    this._clearCurrentColorValueSelects();
    this._createNewColorValueSelects();
  }
  
  _clearCurrentColorValueSelects() {
    let colorValueSelect = this.valueSelectContainer.lastElementChild;
    while (colorValueSelect) { 
      this.valueSelectContainer.removeChild(colorValueSelect); 
      colorValueSelect = this.valueSelectContainer.lastElementChild; 
    } 
  }
  
  async _createNewColorValueSelects() {
    Object.keys(this.currentColorsByValue).forEach(async (value) => {
      let colorValueSelectDiv = await this._createColorValueSelect(value);
      this.valueSelectContainer.appendChild(colorValueSelectDiv);
    })
  }
  
  async _createColorValueSelect(value) {
    let colorPicker = await lively.create("bp2019-color-selection-item")
    colorPicker.setColorStore(this.colorStore)
    colorPicker.setName(value)
    colorPicker.setColor(this.currentColorsByValue[value])
    colorPicker.addListener(this)
    
    let row = <div class="row"></div>;
    row.appendChild(colorPicker)
    
    return row
  }
  
  _applySelectedValues() {
    this.colorStore.updateColorsByValueForAttribute(this.currentAttribute, this.currentColorsByValue);
    this._applyColoringChangedAction();
  }
    
  _applyColoringChangedAction() {
    let colorAction = this._createColorAction();
    
    this.listeners.forEach((listener) => {
      listener.applyAction(colorAction);
    })
  }
    
  _createColorAction() {
    let isGlobal = this.get('#is-global').checked
    return new ColorAction(this.currentAttribute, isGlobal, this.dataProcessor, this.colorStore);
  }  
  
}