"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

export default class Bp2019YAxisControlWidget extends Morph {
  
  async initialize() {
    this.dataProcessor = undefined
    this.listeners = []
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  addListener(listener) {
    assertCanvasWidgetInterface(listener)
    this.listeners.push(listener)
  }
  
  removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
  }
  
  applyAction(action) {
    this.listeners.forEach(listener => {
      listener.applyAction(action)
    })
  }
  
  initializeAfterDataFetch() {
    this._initializeWidgets()
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWidgets(){
    let attributes = this.dataProcessor.getAllAttributes();
    
    let xAxisGroupingWidget = this.get("#x-group-widget")
    let yAxisGroupingWidget = this.get("#y-group-widget")
    
    
    this._initializeWidgetWithData(xAxisGroupingWidget, attributes)
    this._initializeWidgetWithData(yAxisGroupingWidget, attributes)
    xAxisGroupingWidget.axis = "x"
    yAxisGroupingWidget.axis = "y"
  }
  
  _initializeWidgetWithData(widget, dataForWidget){
    assertActionWidgetInterface(widget);
    widget.addListener(this);
    widget.initializeWithData(dataForWidget);
  }
  
}