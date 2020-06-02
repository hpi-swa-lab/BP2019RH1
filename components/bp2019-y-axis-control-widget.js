"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

import Bp2019ControlPanelWidget from "./bp2019-control-panel-widget.js"

export default class Bp2019YAxisControlWidget extends Bp2019ControlPanelWidget {
  
  async initialize() {
    super.initialize()
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
    
    this.xAxisGroupingWidget = this.get("#x-group-widget")
    this.yAxisGroupingWidget = this.get("#y-group-widget")
    
    
    this._initializeWidgetWithData(this.xAxisGroupingWidget, attributes)
    this._initializeWidgetWithData(this.yAxisGroupingWidget, attributes)
    this.xAxisGroupingWidget.axis = "x"
    this.yAxisGroupingWidget.axis = "y"
  }
  
  _initializeWidgetWithData(widget, dataForWidget){
    assertActionWidgetInterface(widget);
    widget.addListener(this);
    widget.initializeWithData(dataForWidget);
  }
  
}