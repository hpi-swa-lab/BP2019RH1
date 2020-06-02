import { assertActionWidgetInterface, assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"

import Bp2019ControlPanelWidget from "./bp2019-control-panel-widget.js"

import Morph from "src/components/widgets/lively-morph.js"

export default class Bp2019MapControlWidget extends Bp2019ControlPanelWidget {
  async initialize() {
    super.initialize()
    
    this.listeners = []
    
    this.districtTooltipDiv = this.get("#bp2019-map-control-widget-district-tooltip-div")
    this.individualTooltipDiv = this.get("#bp2019-map-control-widget-individual-tooltip-div")
    this.menu = this.get("#bp2019-map-control-widget-root-container")
    this.toggleButton = this.get("#control-panel-toggle-button")
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  getDistrictTooltip() {
    return this.districtTooltipDiv
  }
  
  getIndividualTooltip() {
    return this.individualTooltipDiv
  }
  
  getMenu() {
    return this.menu
  }
  
  setExtent(extent) {
    lively.setExtent(this.menu, extent)
    let width = extent.x - lively.getExtent(this.toggleButton).x - 30
    this.districtTooltipDiv.style.width = width.toString() + "px"
    this.individualTooltipDiv.style.width = width.toString() + "px"
  }
  
  async initializeAfterDataFetch() {
    //this._initializeWidgets()
  }
  
  applyAction(action) {
    this.listeners.forEach( (listener) => {
      listener.applyAction(action)
    })
  }
  
  addListener(listener) {
    this.listeners.push(listener)
    assertCanvasWidgetInterface(listener)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------  
  
  _initializeWidgets(){
    let valueByAttribute = this.dataProcessor.getValuesByAttribute()
    let attributes = this.dataProcessor.getAllAttributes()
    
    let attributesSupportingColoring = []
    attributes.forEach(attribute => {
      if (!(this.dataProcessor.currentAttributes[attribute].value_type === "object")) {
        attributesSupportingColoring.push(attribute)
      }
    })    
    
    this._initializeWidgetWithData("#filter-widget", valueByAttribute)
    this._initializeWidgetWithData("#select-widget", valueByAttribute) 
    this._initializeWidgetWithData("#color-widget", attributesSupportingColoring)
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget){
    let widget = this.get(widgetName)
    assertActionWidgetInterface(widget)
    widget.addListener(this)
    widget.initializeWithData(dataForWidget)
  }
}