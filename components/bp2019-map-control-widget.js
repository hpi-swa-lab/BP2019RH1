import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"

import Bp2019ControlPanelWidget from "./bp2019-control-panel-widget.js"

export default class Bp2019MapControlWidget extends Bp2019ControlPanelWidget {
  async initialize() {
    super.initialize()
    
    this.listeners = []
    this.districtTooltipDiv = this.get("#bp2019-map-control-widget-district-tooltip-div")
    this.menu = this.get("#bp2019-map-control-widget-root-container")
    this.controlPanelToggleButton = this.get("#control-panel-toggle-button")
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
  
  getMenu() {
    return this.menu
  }
  
  setExtent(extent) {
    lively.setExtent(this.menu, extent)
    let width = extent.x - lively.getExtent(this.controlPanelToggleButton).x - 30
    this.districtTooltipDiv.style.width = width.toString() + "px"
  }
  
  async initializeAfterDataFetch() {
  }
  
  addListener(listener) {
    this.listeners.push(listener)
    assertCanvasWidgetInterface(listener)
  }
}