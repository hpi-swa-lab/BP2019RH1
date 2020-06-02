import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import VennDiagram from "../src/internal/individuals-as-points/venn/venn-diagram.js"
import Morph from 'src/components/widgets/lively-morph.js'
import { ThemeGroupAddedActionType, ThemeGroupUpdatedActionType, ThemeGroupRemovedActionType, ColorActionType, FilterActionType, SelectActionType } from "../src/internal/individuals-as-points/common/actions.js"

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export default class VennWidget extends Morph {
  async initialize() {
    this.dataProcessor = undefined
    this.colorStore = undefined
    
    this.listeners = []
    this.name = "venn-widget"
    this.controlWidget = this.get("#venn-widget-control-widget")
    this.controlWidget.addListener(this)
    this.canvasContainer = this.get('#venn-widget-canvas-container')
    this.canvas = this.get('#venn-widget-canvas')
    this.vennDiagram = new VennDiagram(this.canvas)
    
    this.currentActions = {}
  }
  
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  

  // *** Interface to application ***
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
    this._propagateDataProcessor()
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
    this._propagateColorStore()
  }
  
  setExtent(extent) {
    this.controlWidget.setHeight(extent.y)
    lively.setExtent(this.canvasContainer, extent)
    this._updateCanvasExtent()
  }
  
  getData() {
    return this.individuals
  }
  
  async setData(individuals) {
    this.individuals = individuals
    this._initializeWithData()
  }
  
  // *** Interface to control menu ***
  
  async applyAction(action){
    this._dispatchAction(action)
  }
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  async stop(){
    this.vennDiagram.stopSimulation()
  }
  
  async activate() {
    this._updateCanvasExtent()
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)  
    this.vennDiagram.setDataProcessor(this.dataProcessor)
  }
  
  _propagateColorStore() {
    this.vennDiagram.setColorStore(this.colorStore)
  }
  
  _initializeWithData(){
    this._initializeControlWidget()
    this._initializeVennDiagramWithData()
  }
  
  _initializeControlWidget() {
    this.controlWidget.initializeAfterDataFetch(this.individuals)
  }
  
  _initializeVennDiagramWithData() {
    this.vennDiagram.setColorStore(this.colorStore)
    this.vennDiagram.initializeWithData(this.individuals)
  }
    
  _applyActionToListeners(action){
    this.listeners.forEach((listener) => {
      listener.applyAction(action);
    })
  }
  
  
  _dispatchAction(action) {
    switch(action.getType()) {
      case (ThemeGroupAddedActionType):
        this._addThemeGroup(action);
        break;
      case (ThemeGroupUpdatedActionType):
        this._updateThemeGroup(action);
        break;
      case (ThemeGroupRemovedActionType):
        this._removeThemeGroup(action);
        break;
      case (ColorActionType):
        this._colorIndividuals(action);
        break;
      case (FilterActionType):
        this._filterIndividuals(action);
        break;
      case (SelectActionType):
        this._selectIndividuals(action);
        break;
      default:
        this._handleNotSupportedAction(action);
     }
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
  
  _selectIndividuals(selectAction) {
    this.vennDiagram.selectIndividuals(selectAction)
  }

  _handleNotSupportedAction(action) {
  }
  
  _updateCanvasExtent() {
    let extentOfParentContainer = this.canvasContainer.getBoundingClientRect()
    let newCanvasWidth = extentOfParentContainer.width
    let newCanvasHeight = extentOfParentContainer.height
    
    this.canvas.width = newCanvasWidth
    this.canvas.height = newCanvasHeight
    
    this.vennDiagram.setCanvasExtent(newCanvasWidth, newCanvasHeight)
  }
}