import {
  SelectAction,
  FilterAction, 
  ColorAction, 
  NullAction,
  SelectActionType,
  FilterActionType, 
  ColorActionType, 
  NullActionType
} from "./actions.js"

import { deepCopy } from "./utils.js"

export class State {
  constructor () {
    this.filterAction = new NullAction()
    this.selectAction = new NullAction()
    this.colorAction = new NullAction()
  }
  
  static fromState(state) {
    let newState = new State()
    newState.filterAction = deepCopy(state.filterAction)
    newState.selectAction = deepCopy(state.selectAction)
    newState.colorAction = deepCopy(state.colorAction)
    return newState
  }
  
  updateState(action) {
    action = deepCopy(action)
    
    switch(action.getType()) {
      case (ColorActionType):
        this._applyColorAction(action)
        break
      case (SelectActionType):
        this._applySelectAction(action)
        break
      case (FilterActionType):
        this._applyFilterAction(action)
        break
      default:
        break
    }
  }
  
  _applyColorAction(action) {
    this.colorAction = action
  }
  
  _applySelectAction(action) {
    this.selectAction = action
  }
  
  _applyFilterAction(action) {
    this.filterAction = action
  }

}