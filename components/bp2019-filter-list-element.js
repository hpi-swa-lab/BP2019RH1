"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';

import {
  assertFilterListItemListenerInterface, 
  assertAtomicFilterActionInterface
} from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/interfaces.js"

export default class Bp2019FilterListElement extends Morph {
  async initialize() {
    this.listeners = []
    
    this.atomicFilter = {}
    
    this.attributeView = this.get("#attribute-view")
    this.valuesView = this.get("#values-view")
    this.deleteButton = this.get("#delete-button")
    
    this.deleteButton.addEventListener("click", () => this._delete())
  }
  
  addListener(listener) {
    assertFilterListItemListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  setFilter(atomicFilter) {
    assertAtomicFilterActionInterface(atomicFilter)
    this.atomicFilter = atomicFilter
    this.attributeView.innerHTML = "Filter Attribute: " + atomicFilter.getAttribute()
    this.valuesView.innerHTML = "FilterValues: " + atomicFilter.getFilterValues()
  }
  
  getFilter() {
    return this.atomicFilter
  }
  
  _delete() {
    this.listeners.forEach(listener => {
      listener.deleteFilterListItem(this)
    })
  }  
  
}