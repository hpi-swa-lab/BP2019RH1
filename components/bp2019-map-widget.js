import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { KenyaMap, SomaliaMap } from "../src/internal/individuals-as-points/map/map.js"

import ColorStore from "../src/internal/individuals-as-points/common/color-store.js"
import DataProcessor from "../src/internal/individuals-as-points/common/data-processor.js"
import Morph from "src/components/widgets/lively-morph.js";

import SelectAction from "../src/internal/individuals-as-points/common/actions/select-action.js"
import FilterAction from "../src/internal/individuals-as-points/common/actions/filter-action.js"
import ColorAction from "../src/internal/individuals-as-points/common/actions/color-action.js"

const WIDTH = 5000
const HEIGHT = 5000
const initialPointSize = 5

export default class Bp2019MapWidget extends Morph {
  async initialize() {
    this.listeners = []
    this.name = "bp2019-map-widget"
    
    this.currentMap
    this.drawingCanvas = this.get("#bp2019-map-widget-drawing-canvas")
    this.uniquePolygonCanvas = this.get("#bp2019-map-widget-unique-polygon-canvas")
    this.uniqueIndividualCanvas = this.get("#bp2019-map-widget-unique-individual-canvas")
    
    this.canvasWindow = this.get("#bp2019-map-widget-canvas-container")
    this.container = lively.query(this, "bp2019-individual-visualization")

    lively.removeEventListener("bpmap", this.container, "extent-changed")
  
    lively.addEventListener("bpmap", this.container, "extent-changed", () => {
      this._updateExtent()
    })
    this._updateExtent()
  }
                                            
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  // *** Interface to application ***
  
  async setData(individuals) {
    this.individuals = individuals
    await this._initializeWithData()
  }
  
  applyActionFromRootApplication(action) {
     this._dispatchAction(action)
  }
  
  // *** Interface to control menu ***
  
  applyAction(action){
    if(action.isGlobal){
      this._applyActionToListeners(action)
    } else {
      this._dispatchAction(action)
    }    
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWithData() {
    this.controlWidget = this._registerControlWidget()
    this.menu = this.controlWidget.getMenu()
    this.districtTooltipDiv = this.controlWidget.getDistrictTooltip()
    this.individualTooltipDiv = this.controlWidget.getIndividualTooltip()
    this.legend = this.controlWidget.getLegend()
    
    this._buildMap()
    //this._updateExtent()
  }
  
  _registerControlWidget() {
    let controlWidget = this.get("#bp2019-map-control-widget")
    controlWidget.addListener(this)
    controlWidget.initializeAfterDataFetch()
    
    return controlWidget
  }
  
  _applyActionToListeners(action){
    this.listeners.forEach((listener) => {
      listener.applyAction(action);
    })
  }
  
  _buildMap() {
    if (this.currentMap) {
      this.currentMap.clear()
    }
    
    switch(DataProcessor.datasetName) {
      case 'Somalia':
        this.currentMap = new SomaliaMap(this.canvasWindow, this.container, WIDTH, HEIGHT, initialPointSize, this.drawingCanvas, this.uniquePolygonCanvas, this.uniqueIndividualCanvas, this.districtTooltipDiv, this.individualTooltipDiv, this.legend, this.menu)
        break
      case 'Kenya':
        this.currentMap = new KenyaMap(this.canvasWindow, this.container, WIDTH, HEIGHT, initialPointSize, this.drawingCanvas, this.uniquePolygonCanvas, this.uniqueIndividualCanvas, this.districtTooltipDiv, this.individualTooltipDiv, this.legend, this.menu)
        break
      default:
        throw new Error("this dataset is not supported")
    }
    this.currentMap.load()
  }
  
  _updateExtent() {
    lively.setExtent(this.canvasWindow, lively.getExtent(this.container).subPt(lively.getGlobalPosition(this.canvasWindow).subPt(lively.getGlobalPosition(this.container))).subPt(lively.pt(20,20)))
  }
  
  _dispatchAction(action) {
    switch(true) {
      case (action instanceof ColorAction):
        this._handleColorAction(action)
        break
      case (action instanceof SelectAction):
        this._handleSelectAction(action)
        break
      case (action instanceof FilterAction):
        this._handleFilterAction(action)
        break
      default:
        this._handleNotSupportedAction(action)
     }
  }
  
  _handleColorAction(colorAction) {
    this._recolorNodes(colorAction.attribute)
    this.currentMap.menu.drawingCanvas.draw()
  }
  
  _recolorNodes(currentColorAttribute){
    this.individuals.forEach((node) => {
      debugger
      let nodeUniqueValue = DataProcessor.getUniqueValueFromIndividual(node, currentColorAttribute)
      let colorString = ColorStore.getColorForValue(currentColorAttribute, nodeUniqueValue)
      node.drawing.currentColor = ColorStore.convertRGBStringToReglColorObject(colorString)
    })
  }
  
  _handleSelectAction(action) {
    this.drawingCanvas.draw()
  }
  
  _handleFilterAction(action){
    
  }  
  
  _handleNotSupportedAction(action) {
    lively.notify(this.name + " can't apply this action: " + action.name)
  }
}