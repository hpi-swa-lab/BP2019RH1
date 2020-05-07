import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AtomicFilterAction, SelectAction } from '../src/internal/individuals-as-points/common/actions.js'

export default class SelectWidget extends Morph {
  async initialize() {
    this.name = "select";
    this.get('#is-global').checked = true
    this.onFilterAppliedListeners = []
    this.valuesByAttribute = {}
    this.selectAction = new SelectAction([], this.isGlobal, DataProcessor.current(), ColorStore.current(), ["languages"], ["themes"])
    
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
    this.applyButton = this.get("#apply-button")
    
    this.addToHistoryButton.addEventListener("click", async () => await this._addFilterToHistory())
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
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.onFilterAppliedListeners.push(listener)
  }
  
  initializeWithData(data){
    this._setValuesByAttributes(data);
  }
  
  deleteFilterListItem(filterListItem) {
    this.filterHistoryContainer.removeChild(filterListItem)
    this.selectAction.removeFilter(filterListItem.getFilter())
    
    if(this.selectAction.getNumberOfAtomicFilters() == 0) {
      this._applyEmptyAction()
    } else {
      this._applyFilterHistory()
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
  
  _changeCombinationLogicToSelectedValue() {
    let selectedCombination = this.combinationLogicSelect.options[this.combinationLogicSelect.selectedIndex].value
    this.selectAction.setCombinationLogic(selectedCombination)
    this._applyFilterHistory()
  }
  
  async _addFilterToHistory() {
    let atomicFilter = this._createAtomicFilterFromCurrentSelection()
    
    if (atomicFilter.filterValues.length > 0) {
      this.selectAction.addFilter(atomicFilter)
    
      let filterElement = await lively.create("bp2019-filter-list-element")
      filterElement.setFilter(atomicFilter)
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
  
  _applyEmptyAction() {    
    let selectAction = new SelectAction(
      [], 
      this._isGlobal(), 
      this.dataStore, 
      this.colorStore,
      ["languages"], 
      ["themes"]
    )
    
    let combinationLogic = "and"
    selectAction.setCombinationLogic(combinationLogic)
    
    this.onFilterAppliedListeners.forEach(listener => {
      listener.applyAction(selectAction)
    })
  }
  
  _createAtomicFilterFromCurrentSelection(){
    let currentFilterAttribute = this._getSelectedFilterAttribute();
    let currentFilterValues = this._getSelectedFilterValues();
    
    return new AtomicFilterAction(currentFilterAttribute, currentFilterValues, this._isGlobal(), this.dataProcessor, ["languages"], ["themes"]);
  }
  
  _isGlobal() {
    return this.get('#is-global').checked
  }
  
}