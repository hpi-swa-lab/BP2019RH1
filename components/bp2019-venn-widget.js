import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import VennDiagram from "../src/internal/individuals-as-points/venn/venn-diagram.js"
import Morph from 'src/components/widgets/lively-morph.js'
import { ThemeGroupAddedAction, ThemeGroupUpdatedAction, ThemeGroupRemovedAction, ColorAction, FilterAction } from "../src/internal/individuals-as-points/common/actions.js"

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export default class VennWidget extends Morph {
  async initialize() {
    this.listeners = []
    this.name = "venn-widget"
    this.controlWidget = this.get("#venn-widget-control-widget")
    
    this.vennDiagram = new VennDiagram(this.get('#venn-widget-canvas'))
  }
  
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  

  // *** Interface to application ***
  
  async setData(individuals) {
    this.individuals = individuals;
    this._initializeWithData()
  }
  
  async applyActionFromRootApplication(action) {
     this._dispatchAction(action)
  }
  
  // *** Interface to control menu ***
  
  applyAction(action){
    if(action.isGlobal){
      this._applyActionToListeners(action)
    } else {
      this._dispatchAction(action)
    }
    
    lively.notify("venn received an action")   
    
  }
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  async stop(){
    this.vennDiagram.stopSimulation()
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWithData(){
    this._registerControlWidget()
    this._initializeVennDiagramWithData()
  }
  
  _registerControlWidget() {
    this.controlWidget.addListener(this)
    this.controlWidget.initializeAfterDataFetch(this.individuals)
  }
  
  _initializeVennDiagramWithData() {
    this.vennDiagram.initializeWithData(this.individuals)
  }
    
  _applyActionToListeners(action){
    this.listeners.forEach((listener) => {
      listener.applyAction(action);
    })
  }
  
  
  _dispatchAction(action) {
    switch(true) {
      case (action instanceof ThemeGroupAddedAction):
        this._addThemeGroup(action);
        break;
      case (action instanceof ThemeGroupUpdatedAction):
        this._updateThemeGroup(action);
        break;
      case (action instanceof ThemeGroupRemovedAction):
        this._removeThemeGroup(action);
        break;
      case (action instanceof ColorAction):
        this._colorIndividuals(action);
        break;
      case (action instanceof FilterAction):
        this._filterIndividuals(action);
        break;
      default:
        this._handleNotSupportedAction(action);
     }
    
    //this._setStateForControlWidget(action)
  }
  
  _addThemeGroup(addedAction){
    this.vennDiagram.addThemeGroup(
      addedAction.uuid,
      addedAction.name, 
      addedAction.themes, 
      addedAction.color)
  }
  
  _updateThemeGroup(updatedAction){
    this.vennDiagram.updateThemeGroup(
      updatedAction.uuid,
      updatedAction.name, 
      updatedAction.themes, 
      updatedAction.color)
  }
  
  _removeThemeGroup(removedAction){
    this.vennDiagram.removeThemeGroup(removedAction.uuid)
  }
  
  _colorIndividuals(colorAction){
    this.vennDiagram.recolorIndividuals(colorAction)
  }
  
  _filterIndividuals(filterAction) {
    this.vennDiagram.filterIndividuals(filterAction)
  }

  _handleNotSupportedAction(action) {
    lively.notify(this.name + " can't apply this action: " + action.name);
  }

  _setStateForControlWidget(action) {
    if(action.isGlobal) this.controlWidget.setStateFromAction(action)
  }
}