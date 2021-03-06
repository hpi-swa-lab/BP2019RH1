import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';

export default class GroupChainingControlWidget extends Morph {
  async initialize() {
    this.listeners = [];
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  async initializeAfterDataFetch() {
    this._initializeWidgets();
  }
  
  applyAction(action) {
    this.listeners.forEach( (listener) => {
      listener.applyAction(action);
    })
  }
  
  addListener(listener) {
    this.listeners.push(listener);
    assertCanvasWidgetInterface(listener);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWidgets(){
    let valueByAttribute = this.dataProcessor.getValuesByAttribute();
    let attributes = this.dataProcessor.getAllAttributes();
    
    this._initializeWidgetWithData("#filter-widget", valueByAttribute);
    this._initializeWidgetWithData("#color-widget", attributes);
    this._initializeWidgetWithData("#group-widget", attributes);
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget){
    let widget = this.get(widgetName);
    assertActionWidgetInterface(widget);
    widget.addListener(this);
    widget.initializeWithData(dataForWidget);
  }
}
