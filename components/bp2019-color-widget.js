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
    
    this._initializeButtonsWithCallBacks();
  }
  
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
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeButtonsWithCallBacks(){
    this.get('#color-attribute-apply').addEventListener("click", () => this._applySelectedAttribute())
    this.get('#color-values-apply').addEventListener("click", () => this._applySelectedValues())
  }
  
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
    var colorValueSelect = this.valueSelectContainer.lastElementChild;
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
    let valueSelectId = value + "-select";
    let colorPicker = await this._createColorPicker(value, valueSelectId);
    let colorPickerLabel = this._createColorPickerLabel(value, valueSelectId);
      
    return this._createValueColorSelectRow(colorPickerLabel, colorPicker);
  }
  
  _createValueColorSelectRow(colorPickerLabel, colorPicker) {
    let formGroup = <div class="row"></div>;
    formGroup.appendChild(colorPicker);
    formGroup.appendChild(colorPickerLabel);
    return formGroup
  }
  
  _createColorPickerLabel(value, id) {
    let formLabel = <label class="col-8 col-form-label">{value}</label>;
    formLabel.setAttribute("for", id);
    return formLabel;
  }
  
  async _createColorPicker(value, id) {
    let colorPicker = await lively.create("lively-crayoncolors");
    colorPicker.id = id;
    colorPicker.value = this.currentColorsByValue[value];
    colorPicker.classList.add("col-2", "col-form-label");
    
    return colorPicker;
  }
  
  _applySelectedValues() {
    this.currentColorsByValue = this._getCurrentColorsFromUI();
    ColorStore.updateColorsByValueForAttribute(this.currentAttribute, this.currentColorsByValue);
    this._applyColoringChangedAction();
  }
  
  _getCurrentColorsFromUI(){
    let colorsByValue = {};
    let valueSelectRows = this.valueSelectContainer.children;
    for(let i=0; i<valueSelectRows.length; i++) {
      let selectRow = valueSelectRows[i];
      let value = this._getValueFromSelectRow(selectRow);
      let color = this._getColorFromSelectRow(selectRow);
      colorsByValue[value] = color;
    }
    
    return colorsByValue;
   
  }
  
  _getValueFromSelectRow(selectRow) {
    let labelTarget = selectRow.querySelector("label").getAttribute("for");
    return labelTarget.replace("-select", "");
  }
  
  _getColorFromSelectRow(selectRow) {
    return selectRow.querySelector("lively-crayoncolors").value;
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