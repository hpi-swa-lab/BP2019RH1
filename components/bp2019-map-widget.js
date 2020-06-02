import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { KenyaMap, SomaliaMap } from "../src/internal/individuals-as-points/map/map.js"

import Morph from "src/components/widgets/lively-morph.js";

import { SelectActionType, InspectActionType, FilterActionType, ColorActionType } from '../src/internal/individuals-as-points/common/actions.js'

const WIDTH = 5000
const HEIGHT = 5000
const initialPointSize = 5

export default class Bp2019MapWidget extends Morph {
  async initialize() {
    var iamReady 
    this.ready = new Promise( resolve => {
      iamReady = resolve
    })
    this.listeners = []
    this.name = "bp2019-map-widget"
    this.currentMap
    this.drawingCanvas = this.get("#bp2019-map-widget-drawing-canvas")
    this.uniquePolygonCanvas = this.get("#bp2019-map-widget-unique-polygon-canvas")
    this.uniqueIndividualCanvas = this.get("#bp2019-map-widget-unique-individual-canvas")
    this.canvasWindow = this.get("#bp2019-map-widget-canvas-container")
    this.controlWidget = this.get("bp2019-map-control-widget")
    this.controlWidget.addSizeListener(this)
    this.collapsed = false
    
    this.currentActions = {}
    
    iamReady()
  }
  
  attachedCallback() {
    // here goes checking for windows stuff
  }
  
  detachedCallback() {

  }
                                            
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  // *** Interface to application ***
  
  onSizeChange(collapsed) {
    this.collapsed = collapsed
    this.setExtent(this.extent)
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor  
    this._propagateDataProcessor()
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  getData() {
    return this.individuals
  }
  
  async setData(individuals) {
    this.individuals = individuals
    await this._initializeWithData()
    this.currentMap.updateZoom()
  }
  
  setExtent(extent) {
    this.extent = extent
    if (this.collapsed) {
      lively.setExtent(this.canvasWindow, lively.pt(extent.x - 50, extent.y))
      this.controlWidget.setExtent(lively.pt(45, extent.y))
    } else {
      lively.setExtent(this.canvasWindow, lively.pt(extent.x * 0.73, extent.y))
      this.controlWidget.setExtent(lively.pt(extent.x * 0.23, extent.y))
    }

    if (this.currentMap) { // should be removed
      this.currentMap.updateZoom()
    }
  }
  
  async activate() {
    // should be removed
    await this.ready
    if (this.currentMap) {
      this.currentMap.updateZoom()
    }
  }
  
  // *** Interface to control menu ***
  
  async applyAction(action){
    this._dispatchAction(action)   
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)  
  }
  
  async _initializeWithData() {
    this.controlWidget = this._registerControlWidget()
    this.districtTooltipDiv = this.controlWidget.getDistrictTooltip()
    this.individualTooltipDiv = this.controlWidget.getIndividualTooltip()
    
    await this._buildMap()
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
  
  async _buildMap() {
    if (this.currentMap) {
      this.currentMap.clear()
    }
    
    switch(this.dataProcessor.datasetName) {
      case 'Somalia':
        this.currentMap = new SomaliaMap(this, WIDTH, HEIGHT, initialPointSize)
        break
      case 'Kenya':
        this.currentMap = new KenyaMap(this, WIDTH, HEIGHT, initialPointSize)
        break
      default:
        throw new Error("this dataset is not supported")
    }
    
    this._initializeCurrentMap()
    await this.currentMap.create(this.individuals)
  }
  
  _initializeCurrentMap() {
    this.currentMap.setDataProcessor(this.dataProcessor)
    this.currentMap.setColorStore(this.colorStore)
  }
  
  _dispatchAction(action) {
    switch(action.getType()) {
      case (ColorActionType):
        this._handleColorAction(action)
        break
      case (InspectActionType):
        this._handleInspectAction(action)
        break
      case (SelectActionType):
        this._handleSelectAction(action)
        break
      case (FilterActionType):
        this._handleFilterAction(action)
        break
      default:
        this._handleNotSupportedAction(action)
     }
  }
  
  _handleColorAction(colorAction) {
    colorAction.runOn(this.individuals)  
    this.currentMap.draw()
  }
  
  _handleInspectAction(action) {
    action.runOn(this.individuals)
    this.currentMap.individualClicker.deselectSelectedIndividual()
    if (!action.selection) {
      this.currentMap.individualClicker.selectIndividual(null)
    } else {
      let individual = this._getIndividualById(action.selection.id)
      this.currentMap.individualClicker.selectIndividual(individual)
    }
    
    this.currentMap.draw()
  }
  
  _handleFilterAction(action){ 
    let filteredIndividuals = action.runOn(this.individuals)
    if (!filteredIndividuals.includes(this.currentMap.dataHandler.selectedIndividual)) {
      this.currentMap.individualClicker.deselectSelectedIndividual()
    }
    
    this.currentMap.updateIndividuals(filteredIndividuals)
  }
  
  _handleSelectAction(action) {
    action.runOn(this.individuals)
    this.currentMap.draw()
  }
  
  _handleNotSupportedAction(action) {}
  
  _getIndividualById(id) {
    for (let i = 0; i < this.individuals.length; i++) {
      if (this.individuals[i].id === id) {
        return this.individuals[i]
      }
    }
  }
}