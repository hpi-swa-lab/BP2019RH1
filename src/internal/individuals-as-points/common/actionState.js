import {
  SelectAction,
  FilterAction, 
  ColorAction, 
  InspectAction,
  NullAction,
  SelectActionType,
  FilterActionType, 
  ColorActionType, 
  NullActionType,
  InspectActionType
} from "./actions.js"

import { DataProcessorType } from "./data-processor.js"
import { ColorStoreType } from "./color-store.js"
import { GeoDataType } from "../../../geodata/geoData.js"

import { deepCopy } from "./utils.js"

export class State {
  constructor () {
    this.filterAction = new FilterAction()
    this.filterAction.setIncludeStop(false)
    this.selectAction = new SelectAction()
    this.colorAction = new ColorAction()
    this.inspectAction = new InspectAction()
    this.localActions = []
    this.dataProcessor = {}
    this.colorStore = {}
    this.geoData = {}
  }
  
  static fromState(state) {
    let newState = new State()
    newState.filterAction = deepCopy(state.filterAction)
    newState.selectAction = deepCopy(state.selectAction)
    newState.colorAction = deepCopy(state.colorAction)
    newState.inspectAction = state.inspectAction // deepCopy not needed?
    newState.localActions = deepCopy(state.localActions)
    newState.colorStore = state.colorStore
    newState.dataProcessor = state.dataProcessor
    newState.geoData = state.geoData
    
    return newState
  }
  
  updateState(element) {
    
    switch(element.getType()) {
      case (ColorActionType):
        this._applyColorAction(deepCopy(element))
        break
      case (SelectActionType):
        this._applySelectAction(deepCopy(element))
        break
      case (FilterActionType):
        this._applyFilterAction(deepCopy(element))
        break
      case (DataProcessorType):
        this._applyNewDataProcessor(element)
        break
      case (ColorStoreType):
        this._applyNewColorStore(element)
        break
      case (GeoDataType):
        this._applyNewGeoData(element)
        break
      case (InspectActionType):
        this._applyNewInspectAction(element)
        break
      default:
        break
    }
  }
  
  updateLocalActions(localActions) {
    this.localActions = deepCopy(localActions)
  }
  
  _applyNewInspectAction(action) {
    this.inspectAction = action
  }
  
  _applyColorAction(action) {
    this.colorAction = action
  }
  
  _applySelectAction(action) {
    action.getAddedFilters().forEach(filter => {
      this.selectAction.addFilter(filter)
    })
    action.getRemovedFilters().forEach(filter => {
      this.selectAction.removeFilter(filter)
    })
    
    this.selectAction.setCombinationLogic(action.getCombinationLogic())
  }
  
  _applyFilterAction(action) {    
    action.getAddedFilters().forEach(filter => {
      this.filterAction.addFilter(filter)
    }) 
    action.getRemovedFilters().forEach(filter => {
      this.filterAction.removeFilter(filter)
    })
    // anything else that needs to be transferred? DataProcessor?
    this.filterAction.setCombinationLogic(action.getCombinationLogic())
  }
  
  _applyNewDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
    if (!this.filterAction.dataProcessor) {
      this.filterAction.setDataProcessor(dataProcessor)
    }
    if (!this.selectAction.dataProcessor) {
      this.selectAction.setDataProcessor(dataProcessor)
    }
    if (!this.colorAction.dataProcessor) {
      this.colorAction.setDataProcessor(dataProcessor)
    }
    if (!this.inspectAction.dataProcessor) {
      this.inspectAction.setDataProcessor(dataProcessor)
    }
  }
  
  _applyNewColorStore(colorStore) {
    this.colorStore = colorStore
    
    if (!this.selectAction.colorStore) {
      this.selectAction.setColorStore(colorStore)
    }
    if (!this.colorAction.colorStore) {
      this.colorAction.setColorStore(colorStore)
    }
    if (!this.inspectAction.colorStore) {
      this.inspectAction.setColorStore(colorStore)
    }
  }
  
  _applyNewGeoData(geoData) {
    this.geoData = geoData
  }


}