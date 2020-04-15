import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import FilterAction from '../src/internal/individuals-as-points/common/actions/filter-action.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "filter";
    this.isGlobal = true;
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    
    this.attributeSelect = this.get("#attribute-select")
    this.valueSelect = this.get("#value-select")
    this.applyButton = this.get("#apply-button")
    
    this.applyButton.addEventListener("click", () => {
      this._applyFilter()
    })
    this.attributeSelect.addEventListener("change", () => {
      this._setFilterValues(this.valuesByAttribute[this._getSelectedFilterAttribute()])
    })
  }
  
  /*
  Expects the folowing format for valuesByAttributes:
  {
    <attribute 1>: [<value 1>, <value 2>, ...],
    <attribute 2>: [<value 1>, <value 2>, ...],
    ...
  }
  */
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.onFilterAppliedListeners.push(listener)
  }
  
  initializeWithData(data){
    this._setValuesByAttributes(data);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _setValuesByAttributes(valuesByAttributes) {
    this.valuesByAttribute = valuesByAttributes
    
    this._setFilterAttributes(Object.keys(valuesByAttributes))
    this._setFilterValues(this.valuesByAttribute[this._getSelectedFilterAttribute()])
  }
  
  _setFilterAttributes(attributes) {
    this._clearSelectOptions(this.attributeSelect)
    attributes.forEach(string => {
      this.attributeSelect.options[this.attributeSelect.options.length] = new Option(string)
    })
  }
  
  _setFilterValues(values) {
    this._clearSelectOptions(this.valueSelect)
    values.forEach(string => {
      this.valueSelect.options[this.valueSelect.options.length] = new Option(string)
    })
  }
  
  _getSelectedFilterAttribute() {
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value;
  }
  
  _getSelectedFilterValues() {
    let selectedValues = [];
    let availableOptionsCount = this.valueSelect.options.length;
    
    for(let i=0; i< availableOptionsCount; i++){
      let option = this.valueSelect.options[i];
      if(option.selected){
        selectedValues.push(option.value);
      }
    }
      
    return selectedValues;
  }
  
  _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0)
    }
  }
  
  _applyFilter() {
    let filterAction = this._createFilterActionFromCurrentSelection();
    
    this.onFilterAppliedListeners.forEach(listener => {
      listener.applyAction(filterAction)
    })
  }
  
  _createFilterActionFromCurrentSelection(){
    let currentFilterAttribute = this._getSelectedFilterAttribute();
    let currentFilterValues = this._getSelectedFilterValues();
    
    return new FilterAction(currentFilterAttribute, currentFilterValues, this.isGlobal);
  }
  
}