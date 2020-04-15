"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

export default class Bp2019YAxisControlWidget extends Morph {
  
  async initialize() {
    this.listeners = []
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
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
    let valuesByAttribute = DataProcessor.getValuesByAttribute();
    let attributes = DataProcessor.getAllAttributes();
    
    let xAxisGroupingWidget = this.get("#x-group-widget")
    let yAxisGroupingWidget = this.get("#y-group-widget")
    
    this._initializeWidgetWithData(this.get("#filter-widget"), valuesByAttribute)
    this._initializeWidgetWithData(this.get("#color-widget"), attributes)
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