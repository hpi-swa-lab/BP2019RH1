import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { FilterAction, AtomicFilterAction } from '../src/internal/individuals-as-points/common/actions.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "filter";
    //this.get('#is-global').checked = true
    this.includeStopCheckbox = this.get('#include-stop')
    this.includeStopCheckbox.checked = false
    
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    this.filterAction = new FilterAction()
    this.filterAction.setIncludeStop(false)
    
    this.attributeSelect = this.get("#attribute-select")
    this.valueSelect = this.get("#value-select")
    
    this.attributeSelect.addEventListener("change", () => {
      this._setFilterValues(this.valuesByAttribute[this._getSelectedFilterAttribute()])
    })
    
    this.combinationLogicSelect = this.get("#combination-logic-select")
    this.combinationLogicSelect.addEventListener("change", () => {
      this._changeCombinationLogicToSelectedValue()
    })
    
    let combinationTexts = ["and", "or"]
    combinationTexts.forEach(text => {
      this.combinationLogicSelect.options[this.combinationLogicSelect.options.length] = new Option(text)
    })
    
    this.filterHistoryContainer = this.get("#filter-history-container")
    
    this.addToHistoryButton = this.get("#add-filter-button")
    this.applyButton = this.get("#apply-button")
    
    this.addToHistoryButton.addEventListener("click", async () => await this._addFilterToHistory())
    this._addEventListenerToIncludeStopCheckbox()
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
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
    this.filterAction.setDataProcessor(dataProcessor)
  }  
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.onFilterAppliedListeners.push(listener)
  }
  
  initializeWithData(data){
    if (Object.keys(data).includes("consent_withdrawn")) {
      delete data["consent_withdrawn"]
    }
    this._setValuesByAttributes(data);
    this.includeStopCheckbox.dispatchEvent(new Event("change"))
  }
  
  deleteFilterListItem(filterListItem) {
    this.filterHistoryContainer.removeChild(filterListItem)
    this.filterAction.removeFilter(filterListItem.getFilter())
    this.filterAction.setRemovedFilters([filterListItem.getFilter()])
    this.filterAction.setAddedFilters([])
    this._applyFilterHistory()
  }
  
  async loadState(state) {
    this.filterHistoryContainer.innerHTML = ""
    
    this._setValuesByAttributes(state.dataProcessor.getValuesByAttribute())
    
    this.filterAction = state.filterAction
    
    this.includeStopCheckbox.checked = this.filterAction.includesStop
    
    for (let i=0; i < this.filterAction.filters.length; i++) {
      let filterElement = await lively.create("bp2019-filter-list-element")
      filterElement.setFilter(this.filterAction.filters[i])
      filterElement.addListener(this)

      this.filterHistoryContainer.appendChild(filterElement)
    }
    
    //TODO: load new dataProcessor attributes!
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
    
    for(let i = 0; i < availableOptionsCount; i++){
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
  
  _addEventListenerToIncludeStopCheckbox() {
    this.includeStopCheckbox.addEventListener("change", () => {
      this.filterAction.setIncludeStop(this.includeStopCheckbox.checked)
      this._applyFilterHistory()
    })
  }
  
  _getCombinationLogic() {
    return this.combinationLogicSelect.options[this.combinationLogicSelect.selectedIndex].value
  }
  
  _changeCombinationLogicToSelectedValue() {
    let selectedCombination = this._getCombinationLogic()
    this.filterAction.setCombinationLogic(selectedCombination)
    this._applyFilterHistory()
  }
  
  async _addFilterToHistory() {
    let newFilter = this._createFilterFromCurrentSelection()
    
    if (this.filterAction.filters.some(filter => filter.equals(newFilter))) {
      lively.error("This filter already exists")
      return
    }
    
    if (newFilter.filterValues.length > 0) {
      this.filterAction.addFilter(newFilter)
      this.filterAction.setAddedFilters([newFilter])
      this.filterAction.setRemovedFilters([])

      let filterElement = await lively.create("bp2019-filter-list-element")
      filterElement.setFilter(newFilter)
      filterElement.addListener(this)

      this.filterHistoryContainer.appendChild(filterElement)

      this._applyFilterHistory()
    } else {
      lively.notify("Please select values")
    }
  }
  
  _applyFilterHistory() {
    this.onFilterAppliedListeners.forEach(listener => {
      listener.applyAction(this.filterAction)
    })
  }
  
  _createFilterFromCurrentSelection(){
    let currentFilterAttribute = this._getSelectedFilterAttribute();
    let currentFilterValues = this._getSelectedFilterValues();
    return new AtomicFilterAction(currentFilterAttribute, currentFilterValues, this.dataProcessor, this._isGlobal)
  }
  
  _isGlobal() {
    //return this.get('#is-global').checked
  }
  
}