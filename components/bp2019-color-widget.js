import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import ColorAction from '../src/internal/individuals-as-points/common/actions/color-action.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.listeners = [];
    this.name = "color";
    this.isGlobal = true;
    
    this.currentAttribute = "";
    
    this.attributeSelect = this.get('#color-attribute-select')
    this.valueSelectContainer = this.get('#color-values-select-container');
    
    this.get('#color-attribute-apply').addEventListener("click", () => this._applySelectedAttribute())
    this.get('#color-values-apply').addEventListener("click", () => this._applySelectedValues())  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  initializeWithData(data) {
    this._updateAttributeSelect(data);
  }
  
  setColorForValue(color, value) {
    this.currentColorsByValue[value] = color
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _updateAttributeSelect(attributes){
    this._clearSelectOptions(this.attributeSelect)
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
    this.currentColorsByValue = ColorStore.getColorValuesForAttribute(this.currentAttribute);
    this._createColorValueSelects();
    this._applyColoringChangedAction();
  }
  
  _createColorValueSelects() {
    this._clearCurrentColorValueSelects();
    this._createNewColorValueSelects();
  }
  
  _clearCurrentColorValueSelects(){
    let colorValueSelect = this.valueSelectContainer.lastElementChild;
    while (colorValueSelect) { 
      this.valueSelectContainer.removeChild(colorValueSelect); 
      colorValueSelect = this.valueSelectContainer.lastElementChild; 
    } 
  }
  
  async _createNewColorValueSelects(){
    Object.keys(this.currentColorsByValue).forEach(async (value) => {
      let colorValueSelectDiv = await this._createColorValueSelect(value);
      this.valueSelectContainer.appendChild(colorValueSelectDiv);
    })
  }
  
  async _createColorValueSelect(value) {
    let colorPicker = await lively.create("bp2019-color-selection-item")
    colorPicker.setName(value)
    colorPicker.setColor(this.currentColorsByValue[value])
    colorPicker.addListener(this)
    
    let row = <div class="row"></div>;
    row.appendChild(colorPicker)
    
    return row
  }
  
  _applySelectedValues() {
    ColorStore.updateColorsByValueForAttribute(this.currentAttribute, this.currentColorsByValue);
    this._applyColoringChangedAction();
  }
    
  _applyColoringChangedAction(){
    let colorAction = this._createColorAction();
    
    this.listeners.forEach((listener) => {
      lively.notify("action triggered from color menu")
      listener.applyAction(colorAction);
    })
  }
    
  _createColorAction(){
    return new ColorAction(this.currentAttribute, this.isGlobal);
  }  
  
}