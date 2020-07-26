import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface, assertListenerInterface, assertSizeListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

import { collapse } from "../src/internal/individuals-as-points/common/utils.js"

export default class GlobalControlWidget extends Morph {
  async initialize() {
    this.windowTitle = "Global controls"
    this.listeners = []
    this.widgets = []
    this.sizeListeners = []
    
    this.collapsed = false
    
    this.toggleButton = this.get("#control-panel-toggle-button")
    this.toggleButton.addEventListener("click", () => {
      this.collapsed = !this.collapsed
      collapse(this, "#control-panel-container", "toggle")
      this.toggleButton.classList.toggle("collapse-button")
      this.toggleButton.classList.toggle("expand-button")
      this._setCollapsedPosition()
      if (this.extent) {
        this.setExtent(this.extent)
      }
    })
    
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  async initializeAfterDataFetch() {
    this._initializeWidgets()
  }
  
  applyAction(action) {
    this.listeners.forEach( (listener) => {
      listener.applyAction(action)
    })
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  addSizeListener(listener) {
    assertSizeListenerInterface(listener)
    this.sizeListeners.push(listener)
  }
  
  clearListeners() {
    this.listeners = []
  }
  
  close() {
    if(this.parentElement) this.parentElement.remove()
  }
  
  loadState(state) {
    this.setDataProcessor(state.dataProcessor)
    this.setColorStore(state.colorStore)
    this.widgets.forEach(widget => widget.loadState(state))
  }
    
  setData(data) {
    
  }
  
  setExtent(extent) {
    this.extent = extent
    if (this.collapsed) {
      lively.setExtent(this, lively.pt(45, extent.y))
    } else {
      lively.setExtent(this, extent)
    }
  }
  
  setPosition(position) {
    this.position = position
  }
  
  setToNotCollapsable() {
    this.toggleButton.style.display = "none"
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _setCollapsedPosition() {
    if (this.collapsed) {
      lively.setPosition(this, lively.pt(this.position.x + 155, this.position.y))
    } else {
      lively.setPosition(this, this.position)
    }
  }
   
  _initializeWidgets() {
    let attributes = this.dataProcessor.getAllAttributes()
    let valuesByAttribute = this.dataProcessor.getValuesByAttribute()
    this._initializeWidgetWithData("#color-widget", attributes)
    this._initializeWidgetWithData("#select-widget", valuesByAttribute)
    this._initializeWidgetWithData("#filter-widget", valuesByAttribute)
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget) {
    let widget = this.get(widgetName)
    assertActionWidgetInterface(widget)
    widget.addListener(this)
    widget.setDataProcessor(this.dataProcessor)
    widget.setColorStore(this.colorStore)
    widget.initializeWithData(dataForWidget)
    this.widgets.push(widget)
  }
}
