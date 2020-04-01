import Morph from 'src/components/widgets/lively-morph.js'
import assertListenerInterface from '../src/internal/individuals-as-points/common/interfaces.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "filter";
    
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    
    this.attributeSelect = this.get("#attributeSelect")
    this.valueSelect = this.get("#valueSelect")
    this.applyButton = this.get("#applyButton")
    
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
  
  setData(data) {
    this._setValuesByAttributes(data);
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.onFilterAppliedListeners.push(listener)
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
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value
  }
  
  _getSelectedFilterValue() {
    return this.valueSelect.options[this.valueSelect.selectedIndex].value
  }
  
  _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0)
    }
  }
  
  _applyFilter() {
    this.onFilterAppliedListeners.forEach(listener => {
      listener.applyAction(this)
    })
  }
  
}