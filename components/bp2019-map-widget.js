import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { KenyaMap, SomaliaMap } from "../src/internal/individuals-as-points/map/map.js"

import ColorStore from "../src/internal/individuals-as-points/common/color-store.js"
import DataProcessor from "../src/internal/individuals-as-points/common/data-processor.js"
import Morph from "src/components/widgets/lively-morph.js";

import { InspectAction, FilterAction, FilterActionChain, ColorAction } from '../src/internal/individuals-as-points/common/actions.js'
import { deepCopy } from "../src/internal/individuals-as-points/common/utils.js"

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
    this.legend = lively.query(this, "#legend-widget")
    
    let window = lively.allParents(this, [], true)
      .find(ea => ea && ea.isWindow)

    if (window) {
      this.container = window.target
    }
  
    this._addEventListenerForResizing()
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
  
  async setData(individuals) {
    this.individuals = individuals
    this.deletedIndividuals = []
    await this._initializeWithData()
    this.initialIndividuals = deepCopy(this.individuals)
    if (this.container) {
      this.activate()
    }
  }
  
  async applyActionFromRootApplication(action) {
     this._dispatchAction(action)
  }
  
  async activate() {
    await this.ready
    debugger
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
  
  _addEventListenerForResizing() {
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
    
    switch(DataProcessor.current().datasetName) {
      case 'Somalia':
        this.currentMap = new SomaliaMap(this, WIDTH, HEIGHT, initialPointSize)
        break
      case 'Kenya':
        this.currentMap = new KenyaMap(this, WIDTH, HEIGHT, initialPointSize)
        break
      default:
        throw new Error("this dataset is not supported")
    }
    
    return this.currentMap.create(this.individuals)
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
      case (action instanceof FilterAction):
        this._handleFilterAction(action)
        break
      case (action instanceof FilterActionChain):
        this._handleFilterActionChain(action)
        break
      default:
        this._handleNotSupportedAction(action)
     }
  }
  
  _handleColorAction(colorAction) {
    this._recolorNodes(colorAction.attribute)
    this.currentMap.individualClicker.highlightSelectedIndividual()
    this._updateExtent()
    this.currentMap.updateExtent()
    this.currentMap.draw()
  }
  
  _recolorNodes(currentColorAttribute){
    this.individuals.forEach((individual) => {
      let nodeUniqueValue = DataProcessor.current().getUniqueValueFromIndividual(individual, currentColorAttribute)
      let colorString = ColorStore.current().getColorForValue(currentColorAttribute, nodeUniqueValue)
      individual.drawing.defaultColor = ColorStore.current().convertRGBStringToRGBAColorObject(colorString)
      individual.drawing.currentColor = ColorStore.current().convertRGBStringToRGBAColorObject(colorString)
    })
  }
  
  _handleInspectAction(action) {
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
    let filteredIndividuals = deepCopy(this.individuals)    
    filteredIndividuals = action.runOn(filteredIndividuals)
    let filteredIndividualsIndices = this._getIndividualIndices(filteredIndividuals)
    
    this.deletedIndividuals = []
    this.currentIndividuals = []
    this.individuals.forEach(individual => {
      if (filteredIndividualsIndices.includes(individual.index)) {
        this.currentIndividuals.push(individual)
      } else {
        this.deletedIndividuals.push(individual)
      }
    })
    
    if (this.deletedIndividuals.includes(this.currentMap.dataHandler.selectedIndividual)) {
      this.currentMap.individualClicker.deselectSelectedIndividual()
    }
    
    this.currentMap.updateIndividuals(this.currentIndividuals)
  }
  
  _handleFilterActionChain(actionChain) {
    this._handleFilterAction(actionChain)
  }
  
  _handleNotSupportedAction(action) {
    lively.notify(this.name + " can't apply this action: " + action.name)
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