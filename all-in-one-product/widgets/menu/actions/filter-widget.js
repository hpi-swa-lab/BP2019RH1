import Morph from 'src/components/widgets/lively-morph.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "filter";
    
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    
    this.attributeSelect = this.get("#attributeSelect")
    this.valueSelect = this.get("#valueSelect")
    this.applyButton = this.get("#applyButton")
    
    this.applyButton.addEventListener("click", () => {
      this.applyFilter()
    })
    this.attributeSelect.addEventListener("change", () => {
      this.setFilterValues(this.valuesByAttribute[this.getSelectedFilterAttribute()])
    })
  }
  
  //getters and setters
  
  /*
  Expects the folowwing format for valuesByAttributes:
  {
    <attribute 1>: [<value 1>, <value 2>, ...],
    <attribute 2>: [<value 1>, <value 2>, ...],
    ...
  }
  */
  
  setData(data) {
    this.setValuesByAttributes(data);
  }
  
  setValuesByAttributes(valuesByAttributes) {
    this.valuesByAttribute = valuesByAttributes
    
    this.setFilterAttributes(Object.keys(valuesByAttributes))
    this.setFilterValues(this.valuesByAttribute[this.getSelectedFilterAttribute()])
  }
  
  setFilterAttributes(attributes) {
    this.clearSelectOptions(this.attributeSelect)
    attributes.forEach(string => {
      this.attributeSelect.options[this.attributeSelect.options.length] = new Option(string)
    })
  }
  
  setFilterValues(values) {
    this.clearSelectOptions(this.valueSelect)
    values.forEach(string => {
      this.valueSelect.options[this.valueSelect.options.length] = new Option(string)
    })
  }
  
  getSelectedFilterAttribute() {
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value
  }
  
  getSelectedFilterValue() {
    return this.valueSelect.options[this.valueSelect.selectedIndex].value
  }
  
  //helper methods
  
  clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0)
    }
  }
  
  //events
  
  applyFilter() {
    this.onFilterAppliedListeners.forEach(listener => {
      listener.applyAction(this)
    })
  }
  
  //onFilterAppliedListener methods
  
  addListener(listener) {
    this.assertListenerInterface(listener)
    
    this.onFilterAppliedListeners.push(listener)
  }
  
  removeOnFilterAppliedListener(listener) {
    this.onFilterAppliedListeners.splice(this.onFilterAppliedListeners.indexOf(listener), 1)
  }
  
  //interfaces
  
  assertListenerInterface(listener) {
    if ((typeof listener.applyAction) === "undefined") {
      throw new Error('The listener must implement applyAction');
    }
  }
}