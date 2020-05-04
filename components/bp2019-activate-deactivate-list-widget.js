"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';

import { assertActivateDeactivateListListenerInterface } from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/interfaces.js"

export default class Bp2019ActivateDeactivateListWidget extends Morph {
  async initialize() {
    this.listeners = []
    this.activeItems = []
    this.inactiveItems = []
    
    this.inactiveItemsSelect = this.get("#inactive-items-select")
    this.activeItemsSelect = this.get("#active-items-select")
    
    this.get("#activate-button").addEventListener("click", () => {this._activateSelectedItems()})
    this.get("#deactivate-button").addEventListener("click", () => {this._deactivateSelectedItems()})
  }
  
  addListener(listener) {
    assertActivateDeactivateListListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  setActiveItems(itemNames) {
    this.activeItems = itemNames
    this._setSelectionContent(this.activeItemsSelect, itemNames)
  }
  
  setInactiveItems(itemNames) {
    this.inactiveItems = itemNames
    this._setSelectionContent(this.inactiveItemsSelect, itemNames)
  }
  
  _activateSelectedItems() {
    let activatedItems = this._getSelectedOptions(this.inactiveItemsSelect)
    this._removeItemsFromSelect(this.inactiveItemsSelect, activatedItems)
    this._addItemsToSelect(this.activeItemsSelect, activatedItems)
    
    let activatedItemNames = this._getValuesFromOptions(activatedItems)
    
    this.listeners.forEach(listener => {
      listener.onItemsActivated(activatedItemNames)
    })
  }
  
  _deactivateSelectedItems() {
    let deactivatedItems = this._getSelectedOptions(this.activeItemsSelect)
    this._removeItemsFromSelect(this.activeItemsSelect, deactivatedItems)
    this._addItemsToSelect(this.inactiveItemsSelect, deactivatedItems)
    
    let deactivatedItemNames = this._getValuesFromOptions(deactivatedItems)
    
    this.listeners.forEach(listener => {
      listener.onItemsDeactivated(deactivatedItemNames)
    })
  }
  
  _addItemsToSelect(select, items) {
    items.forEach(item => {
      select.options[select.options.length] = item
    })
  }
  
  _removeItemsFromSelect(select, items) {
    items.forEach(item => {
      select.removeChild(item)
    })
  }
  
  _getSelectedOptions(select) {
    let result = [];
    let options = select && select.options;
    
    for (let i = 0; i < options.length; i++) {
      let option = options[i]
      if (option.selected) {
        result.push(option)
      }  
    }
    
    return result;
  }
  
  _getValuesFromOptions(options) {
    let result = []
    
    for(let i = 0; i < options.length; i++) {
      result.push(options[i].value)
    }
    
    return result
  }
  
  _setSelectionContent(select, itemNames) {
    this._clearSelectionContent(select)
    this._createNewSelectionItems(select, itemNames)
  }
  
  _clearSelectionContent(select) {
    while(select.options.length > 0) {
      select.options.remove(0);
    }
  }
  
  _createNewSelectionItems(select, itemNames) {
    itemNames.forEach(itemName => {
      select.options[select.options.length] = new Option(itemName)
    })
  }
  
}