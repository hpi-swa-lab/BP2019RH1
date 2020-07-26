import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { KenyaMap, SomaliaMap } from "../src/internal/individuals-as-points/map/map.js"

import Morph from "src/components/widgets/lively-morph.js"
import d3 from 'src/external/d3.v5.js'

import FreehandDrawer from '../src/internal/individuals-as-points/common/drawFreehand.js'
import inside from "../src/internal/individuals-as-points/common/npm-point-in-polygon.js"

import { SelectActionType, InspectActionType, FilterActionType, ColorActionType } from '../src/internal/individuals-as-points/common/actions.js'

const INITIAL_POINT_SIZE = 5

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
    this.freehandSelectionSVG = this.get("#bp2019-map-widget-free-hand-selection-svg")
    this.controlWidget = this.get("bp2019-map-control-widget")
    this.controlPanelContainer = this.get("#map-control-widget-container")
    this.controlWidget.addSizeListener(this)
    this.collapsed = false
    this.strokeStyle = false
    
    this.currentActions = {}
    
    // freehand drawCanvas the size of canvas-window
    this.drawer = new FreehandDrawer(this.canvasWindow, this.drawingCanvas, this.freehandSelectionSVG)
    this.drawer.addListener(this)
        
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
  
  
  setStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
  }
  
  setGeoData(geoData) {
    this.geoData = geoData.data
  }
  
  setContainerType(type) {
    this.containerType = type
  }
  
  updateStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
    this.currentMap.updateStrokeStyle(this.strokeStyle)
  }
  
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
    this.drawer.deleteSelections()
    let currentExtent = this.extent
    if (this.currentMap) {
      this._setMapSize({x: 1000, y: 1000})
    }
    this.individuals = individuals
    await this._initializeWithData()
    this.setExtent(currentExtent)
  }
  
  setExtent(extent) {
    this.extent = extent
    if (this.collapsed) {
      if (this.containerType === "pane") {
        lively.setExtent(this.canvasWindow, lively.pt(extent.x, extent.y))
        this.controlWidget.setExtent(lively.pt(45, extent.y))
        this.setLocalControls()
      } else {
        lively.setExtent(this.canvasWindow, lively.pt(extent.x - 50, extent.y))
        this.controlWidget.setExtent(lively.pt(45, extent.y))
      }
      
    } else {
      if (this.containerType === "pane") {
        lively.setExtent(this.canvasWindow, lively.pt(extent.x, extent.y))
        this.controlWidget.setExtent(lively.pt(200, extent.y))
        this.setLocalControls()
      } else {
        lively.setExtent(this.canvasWindow, lively.pt(extent.x * 0.73, extent.y))
        this.controlWidget.setExtent(lively.pt(extent.x * 0.20, extent.y))
      }
    }
    
    let currentCanvasExtent = lively.getExtent(this.canvasWindow)
    d3.select(this.freehandSelectionSVG)
      .attr("width", currentCanvasExtent.x + "px")
      .attr("height", currentCanvasExtent.y + "px")

    if (this.currentMap) { // should be removed
      // refactor into setter in map
      this._setMapSize(currentCanvasExtent)
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
  
  freehandSelectionCreated() {
    this.currentMap.draw()
    this.drawer.drawSelections()
    this.drawer.applyTransform(this.currentMap.zoomer.transform)
  }
  
  freehandSelectionDeleted(selection) {
    this.currentMap.draw()
    this.drawer.drawSelections()
    this.drawer.applyTransform(this.currentMap.zoomer.transform)
    
    this.dispatchEvent(new CustomEvent("freehand-selection-deleted", {
      detail: {
        selection: selection
      },
      bubbles: true
    }))
  }
  
  freehandSelectionOnContextMenu(evt, selection, selectionSVG) {
    let linePointsArray = selection.linePoints.map(point => [point.x, point.y])
    let selectedIndividuals = this.individuals.filter(point => inside([point.drawing.position.x, point.drawing.position.y], linePointsArray))
    
    this.dispatchEvent(new CustomEvent("freehand-selection-contextmenu", {
      detail: {
        freehandSelectionSVGElement: selectionSVG,
        clientX: evt.clientX,
        clientY: evt.clientY,
        individualsSelection: {selectedIndividuals: selectedIndividuals, selectionColor: selection.color}
      },
      bubbles: true
    }))
  }
  
  setLocalControls() {
    this.unsetLocalControls()
    
    var myWindow = lively.findWindow(this)
    if (myWindow.isWindow) {
      myWindow.get(".window-content").style.overflow = "visible"
    }
    
    this.controlPanelContainer.style.display = "block"
    
    let parentPosition = lively.getGlobalPosition(this)
    
    lively.setGlobalPosition(
      this.controlPanelContainer, 
      parentPosition.addPt(lively.pt(lively.getExtent(this.parentElement).x, 0))
    )

    this.controlPanelContainer.style.zIndex = 20000
  }
  
  unsetLocalControls() {
    this.controlPanelContainer.style.display = "none"
  }

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _setMapSize(size){
    this.currentMap.width = size.x
    this.currentMap.height = size.y
    this.drawingCanvas.width = size.x
    this.drawingCanvas.height = size.y
    this.uniquePolygonCanvas.width = size.x
    this.uniquePolygonCanvas.height = size.y
    this.uniqueIndividualCanvas.width = size.x
    this.uniqueIndividualCanvas.height = size.y    
  }
  
  _addEventListenersForSelection() {
    this.drawer.start()
  }
  
  _removeEventListenersForSelection() {
    this.drawer.stop()
  }
  
  _addEventListenersForNavigation() {
    this.currentMap.addEventListenersForNavigation()
  }
  
  _removeEventListenersForNavigation() {
    this.currentMap.removeEventListenersForNavigation()
  }
  
  _addShiftKeyEventListener() {
    // d3's zooming interaction which is used for navigating consumes all of it's used events, which are the same events required for the selection interaction
    
    this.drawingCanvas.setAttribute("tabindex", 0) //necessary for the ability of the canvas to receive key events
    this.drawingCanvas.addEventListener("keydown", (event) => {
      if (event.key == "Shift") {
        this._addEventListenersForSelection()
        this._removeEventListenersForNavigation()
      }
    })
    this.drawingCanvas.addEventListener("keyup", (event) => {
      if (event.key == "Shift") {
        this._addEventListenersForNavigation()
        this._removeEventListenersForSelection()
      }
    })
  } 
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)  
  }
  
  async _initializeWithData() {
    this.controlWidget = this._registerControlWidget()
    this.districtTooltipDiv = this.controlWidget.getDistrictTooltip()
    
    await this._buildMap()
    
    this._addShiftKeyEventListener()
    this._addEventListenersForNavigation()
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
        this.currentMap = new SomaliaMap(this, INITIAL_POINT_SIZE)
        break
      case 'Kenya':
        this.currentMap = new KenyaMap(this, INITIAL_POINT_SIZE)
        break
      default:
        throw new Error("this dataset is not supported")
    }
    
    this._initializeCurrentMap()
    await this.currentMap.create(this.individuals)
    
    this.currentMap.setStrokeStyle(this.strokeStyle)
  }
  
  _initializeCurrentMap() {
    this.currentMap.setDataProcessor(this.dataProcessor)
    this.currentMap.setColorStore(this.colorStore)
    this.currentMap.setGeoData(this.geoData)
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
    this.currentActions["inspect"] = action
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
  
  _handleFreeHandSelection(linePoints, event) {
    let zoomLevel = this.currentMap.zoomer.currentZoomLevel
    let linePointsArray = linePoints.map(point => [point.x / zoomLevel, point.y / zoomLevel])
    let selectedPoints = this.individuals.filter(point => inside([point.drawing.position.x, point.drawing.position.y], linePointsArray))
    
    this.dispatchEvent(new CustomEvent("selection-contextmenu", {
      detail: {
        selectedPoints: selectedPoints,
        clientX: event.clientX,
        clientY: event.clientY,
        selectionColor: "CadetBlue"
      },
      bubbles: true
    }))
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