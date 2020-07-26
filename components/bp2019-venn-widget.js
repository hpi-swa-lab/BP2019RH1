import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import VennDiagram from "../src/internal/individuals-as-points/venn/venn-diagram.js"
import Morph from 'src/components/widgets/lively-morph.js'
import { ThemeGroupAddedActionType, ThemeGroupUpdatedActionType, ThemeGroupRemovedActionType, ColorActionType, FilterActionType, SelectActionType, InspectActionType, NullActionType, NullAction } from "../src/internal/individuals-as-points/common/actions.js"

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export default class VennWidget extends Morph {
  async initialize() {
    this.dataProcessor = undefined
    this.colorStore = undefined
    this.strokeStyle = false
      
    this.listeners = []
    this.name = "venn-widget"
    this.controlWidget = this.get("#venn-widget-control-widget")
    this.controlWidget.addListener(this)
    this.controlWidget.addSizeListener(this)
    this.canvasContainer = this.get('#venn-widget-canvas-container')
    this.controlPanelContainer = this.get("#venn-widget-control-widget-container")
    this.collapsed = false
    this.canvas = this.get('#venn-widget-canvas')
    this.freehandSelectionSVG = this.get("#bp2019-venn-widget-free-hand-selection-svg")
    this.freehandCanvas = this.get('#venn-widget-freehand-canvas')
    
    this.vennDiagram = new VennDiagram(this, this.canvas, this.freehandSelectionSVG, this.freehandCanvas)

    this.currentActions = {id : "localActionsVenn"}
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
    await this._initializeWithData()
  }
  
  setContainerType(type) {
    this.containerType = type
  }
  
  setLocalControls() {
    this.unsetLocalControls()
    
    var myWindow = lively.findWindow(this)
    if (myWindow.isWindow) {
      myWindow.get(".window-content").style.overflow = "visible"
    }

    this.controlPanelContainer.style.display = "block"
    
    let parentPosition = lively.getGlobalPosition(this)
    lively.setGlobalPosition(this.controlPanelContainer, 
          parentPosition.addPt(lively.pt(lively.getExtent(this.parentElement).x, 0)));    

    /*if(!this.collapsed) {
      lively.setExtent(this.controlPanelContainer, lively.pt(200, this.canvas.height))
    } else {
      lively.setExtent(this.controlPanelContainer, lively.pt(40, this.canvas.height))
    }*/

    this.controlPanelContainer.style.zIndex = 20000; 
  }
  
  unsetLocalControls() {
    this.controlPanelContainer.style.display = "none";
  }
  
  setStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
    this.vennDiagram.setStrokeStyle(strokeStyle)
  }
  
  updateStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
    this.vennDiagram.updateStrokeStyle(strokeStyle)
  }
  
  // *** Interface to control menu ***
  
  async applyAction(action){
    if (action.id === "localActionsVenn") {
      this.controlWidget.loadState(action)
      Object.keys(action).forEach(localAction => {
        if (!(typeof action[localAction] === "string")) {
          this._dispatchAction(action[localAction])
        }
      })
    } else if (!action.id) {
      this._dispatchAction(action)
    }
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
  
  onSizeChange(collapsed) {
    this.collapsed = collapsed
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
    this.controlWidget.setColorStore(this.colorStore)
    this.vennDiagram.setColorStore(this.colorStore)
  }
  
  async _initializeWithData(){
    this._initializeControlWidget()
    await this._initializeVennDiagramWithData()
  }
  
  _initializeControlWidget() {
    this.controlWidget.initializeAfterDataFetch(this.individuals)
  }
  
  async _initializeVennDiagramWithData() {
    this.vennDiagram.setColorStore(this.colorStore)
    await this.vennDiagram.initializeWithData(this.individuals)
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
      case (InspectActionType):
        this._inspectIndividual(action);
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
    this.currentActions[addedAction.uuid] = addedAction
    this._signalLocalActionsChanged()
  }
  
  _updateThemeGroup(updatedAction){
    this.vennDiagram.updateThemeGroup(
      updatedAction.uuid,
      updatedAction.name, 
      updatedAction.themes, 
      updatedAction.color)
    this.currentActions[updatedAction.name] = updatedAction
    this._signalLocalActionsChanged()
  }
  
  _removeThemeGroup(removedAction){
    this.vennDiagram.removeThemeGroup(removedAction.uuid)
    delete this.currentActions[removedAction.uuid]
    delete this.currentActions[removedAction.name]
    this._signalLocalActionsChanged()
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
  
  _inspectIndividual(inspectAction) {
    if(this.vennDigram) this.vennDiagram.inspectIndividual(inspectAction)
  }

  _handleNotSupportedAction(action) {
  }
  
  _updateCanvasExtent() {
    let extentOfParentContainer = this.canvasContainer.getBoundingClientRect()
    let newCanvasWidth = extentOfParentContainer.width
    let newCanvasHeight = extentOfParentContainer.height
    
    this.canvas.width = newCanvasWidth
    this.canvas.height = newCanvasHeight
    
    this.freehandCanvas.width = newCanvasWidth
    this.freehandCanvas.height = newCanvasHeight
    this.freehandSelectionSVG.style.width = newCanvasWidth
    this.freehandSelectionSVG.style.height = newCanvasHeight
    
    this.vennDiagram.setCanvasExtent(newCanvasWidth, newCanvasHeight)
    
    if (!this.collapsed) {
      lively.setExtent(this.controlPanelContainer, lively.pt(200, this.canvas.height))
    } else {
      lively.setExtent(this.controlPanelContainer, lively.pt(40, this.canvas.height))
    }
    
    if (this.containerType === "pane") {
      this.setLocalControls()
    }
  }
  
  _signalLocalActionsChanged(){
    this.dispatchEvent(new CustomEvent("local-actions-changed", {
      detail: {
        localActions: [this.currentActions]
      },
      bubbles: true
    }))
  }
}