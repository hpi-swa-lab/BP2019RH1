import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { KenyaMap, SomaliaMap } from "../src/internal/individuals-as-points/map/map.js"

import Morph from "src/components/widgets/lively-morph.js";

import { SelectAction, InspectAction, FilterAction, ColorAction } from '../src/internal/individuals-as-points/common/actions.js'

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
    this.legend = lively.query(this, "#legend-widget")
    
    let window = lively.allParents(this, [], true)
      .find(ea => ea && ea.isWindow)

    if (window) {
      this.container = window.target
      this._addEventListenerForResizing()
    }
    
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
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor  
    this._propagateDataProcessor()
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
    this._propagateColorStore()
  }
  
  async setData(individuals) {
    this.individuals = individuals
    await this._initializeWithData()
    if (this.container) {
      this.activate()
    }
  }
  
  async applyActionFromRootApplication(action) {
     this._dispatchAction(action)
  }
  
  async activate() {
    await this.ready
    this._updateExtent()
    if (this.currentMap) {
      this.currentMap.updateExtent()
    }
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
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)  
  }
  
  _propagateColorStore() {
    this.legend.setColorStore(this.colorStore)  
  }
  
  async _addEventListenerForResizing() {
    lively.removeEventListener("bpmap", this.container, "extent-changed")
  
    lively.addEventListener("bpmap", this.container, "extent-changed", () => {
      this._updateExtent()
    })
  }
  
  _initializeWithData() {
    this.controlWidget = this._registerControlWidget()
    this.districtTooltipDiv = this.controlWidget.getDistrictTooltip()
    this.individualTooltipDiv = this.controlWidget.getIndividualTooltip()
    
    return this._buildMap()
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
    return this.currentMap.create(this.individuals)
  }
  
  _initializeCurrentMap() {
    this.currentMap.setDataProcessor(this.dataProcessor)
    this.currentMap.setColorStore(this.colorStore)
  }
  
  _updateExtent() {
    let containerExtent = lively.getExtent(this.container)
    let windowGlobalPosition = lively.getGlobalPosition(this.canvasWindow)
    let containerGlobalPosition = lively.getGlobalPosition(this.container)
    let legendExtent = lively.getExtent(this.legend)
    let windowRelativePosition = windowGlobalPosition.subPt(containerGlobalPosition)
    let padding = lively.pt(20,20)
    let legendHeight = lively.pt(0, legendExtent.y)
    let windowExtent = containerExtent.subPt(windowRelativePosition).subPt(padding).subPt(legendHeight)
    lively.setExtent(this.canvasWindow, windowExtent)
  }
  
  _dispatchAction(action) {
    switch(true) {
      case (action instanceof ColorAction):
        this._handleColorAction(action)
        break
      case (action instanceof InspectAction):
        this._handleInspectAction(action)
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
    colorAction.runOn(this.individuals)  
    // need to update due to a change of the legend
    this._updateExtent()
    this.currentMap.updateExtent()
    this.currentMap.draw()
  }
  
  _handleInspectAction(action) {
    action.runOn(this.individuals)
    this.currentMap.individualClicker.deselectSelectedIndividual()
    if (!action.selection) {
      this.currentMap.individualClicker.selectIndividual(null)
    } else {
      let individual = this._getIndividualByIndex(action.selection.index)
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
  
  _handleNotSupportedAction(action) {
  }
  
  _getIndividualIndices(individuals) {
    let filteredIndividualsIndices = individuals.map(individual => {
      return individual.index
    })
    return filteredIndividualsIndices
  }
  
  _getIndividualByIndex(index) {
    for (let i = 0; i < this.individuals.length; i++) {
      if (this.individuals[i].index === index) {
        return this.individuals[i]
      }
    }
  }
}