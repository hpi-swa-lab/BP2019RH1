import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface, assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

export default class GlobalControlWidget extends Morph {
  async initialize() {
    this.windowTitle = "Global controls"
    this.listeners = []
    this.widgets = []
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
  
  clearListeners() {
    this.listeners = []
  }
  
  close() {
    if(this.parentElement) this.parentElement.remove()
  }
  
  loadState(state) {
    this.widgets.forEach(widget => widget.loadState(state))
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWidgets(){
    let attributes = this.dataProcessor.getAllAttributes()
    let valuesByAttribute = this.dataProcessor.getValuesByAttribute()
    this._initializeWidgetWithData("#color-widget", attributes)
    this._initializeWidgetWithData("#select-widget", valuesByAttribute)
    this._initializeWidgetWithData("#filter-widget", valuesByAttribute)
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget){
    let widget = this.get(widgetName)
    assertActionWidgetInterface(widget)
    widget.addListener(this)
    widget.setDataProcessor(this.dataProcessor)
    widget.setColorStore(this.colorStore)
    widget.initializeWithData(dataForWidget)
    this.widgets.push(widget)
  }
}
