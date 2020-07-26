import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AtomicFilterAction, FilterAction, SelectAction } from '../src/internal/individuals-as-points/common/actions.js'

export default class SelectWidget extends Morph {
  async initialize() {
    this.name = "select";
    this.get('#is-global').checked = true
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    
    this.attributeSelect = this.get("#attribute-select")
    this.valueSelect = this.get("#value-select")
    
    this.attributeSelect.addEventListener("change", () => {
      this._setFilterValues(this.valuesByAttribute[this._getSelectedFilterAttribute()])
    })
    
    this.combinationLogicSelect = this.get("#combination-logic-select")
    this.combinationLogicSelect.addEventListener("change", () => {
      this._changeCombinationLogicToSelectedValue()
    })
    
    let combinationTexts = ["logic and", "logic or"]
    combinationTexts.forEach(text => {
      this.combinationLogicSelect.options[this.combinationLogicSelect.options.length] = new Option(text)
    })
    
    this.filterHistoryContainer = this.get("#select-history-container")
    
    this.addToHistoryButton = this.get("#add-select-button")
    
    this.addToHistoryButton.addEventListener("click", async () => await this._addFilterToHistory(this._createFilterFromCurrentSelection()))
    this.selectAction = new SelectAction(new FilterAction(), this.dataProcessor, this.colorStore, this.isGlobal)
    this.selectAction.setIncludeStop(true)
    
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
    this.selectAction.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
    this.selectAction.colorStore = this.colorStore
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
  }
  
  deleteFilterListItem(filterListItem) {
    this.filterHistoryContainer.removeChild(filterListItem)
    this.selectAction.removeFilter(filterListItem.getFilter())
    this.selectAction.setRemovedFilters([filterListItem.getFilter()])
    this.selectAction.setAddedFilters([])
    this._applyFilterHistory()
  }
  
  async loadState(state) {
    // remove everything
    this.filterHistoryContainer.innerHTML = ""
    
    this._setValuesByAttributes(state.dataProcessor.getValuesByAttribute())
    
    // load stuff from state
    this.selectAction = state.selectAction
    
    for (let i=0; i < this.selectAction.getAllFilters().length; i++) {
      let filterElement = await lively.create("bp2019-filter-list-element")
      filterElement.setFilter(this.selectAction.getAllFilters()[i])
      filterElement.addListener(this)

      this.filterHistoryContainer.appendChild(filterElement)
    }
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
  
  _getCombinationLogic() {
    return this.combinationLogicSelect.options[this.combinationLogicSelect.selectedIndex].value
  }
  
  _changeCombinationLogicToSelectedValue() {
    let selectedCombination = this._getCombinationLogic()
    this.selectAction.setCombinationLogic(selectedCombination)
    this._applyFilterHistory()
  }
  
  async _addFilterToHistory(newFilter) {
    if (newFilter.filterValues.length > 0) {
      this.selectAction.addFilter(newFilter)
      this.selectAction.setAddedFilters([newFilter])
      this.selectAction.setRemovedFilters([])
    
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
      listener.applyAction(this.selectAction)
    })  
  }
  
  _createFilterFromCurrentSelection() {
    let currentFilterAttribute = this._getSelectedFilterAttribute();
    let currentFilterValues = this._getSelectedFilterValues();
    
    return new AtomicFilterAction(currentFilterAttribute, currentFilterValues, this.dataProcessor, this._isGlobal());
  }
  
  _isGlobal() {
    return this.get('#is-global').checked
  }
  
}