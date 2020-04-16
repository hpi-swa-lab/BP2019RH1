import DataProcessor from "../src/internal/individuals-as-points/common/data-processor.js"
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import Morph from "src/components/widgets/lively-morph.js";

export default class Bp2019MapControlWidget extends Morph {
  async initialize() {
    this.listeners = []
    
    this.districtTooltipDiv = this.get("#bp2019-map-control-widget-district-tooltip-div")
    this.individualTooltipDiv = this.get("#bp2019-map-control-widget-individual-tooltip-div")
    this.menu = this.get("#bp2019-map-control-widget-root-container")
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  getDistrictTooltip() {
    return this.districtTooltipDiv
  }
  
  getIndividualTooltip() {
    return this.individualTooltipDiv
  }
  
  getMenu() {
    return this.menu
  }
  
  async initializeAfterDataFetch() {
    this._initializeWidgets()
  }
  
  applyAction(action) {
    lively.notify("MapWidget received action")
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
    let valueByAttribute = DataProcessor.getValuesByAttribute()
    let attributes = DataProcessor.getAllAttributes()
    
    this._initializeWidgetWithData("#filter-widget", valueByAttribute);
    this._initializeWidgetWithData("#color-widget", attributes)
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget){
    let widget = this.get(widgetName)
    assertActionWidgetInterface(widget)
    widget.addListener(this)
    widget.initializeWithData(dataForWidget)
  }
}