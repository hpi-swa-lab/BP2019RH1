import Morph from 'src/components/widgets/lively-morph.js';
import { assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

export default class IndividualVisualization extends Morph {
  
  async initialize() {
    this.windowTitle = "Individual visualizations"
    this.canvasWidgets = [];
    this.canvasWidgetTabs = this.get("#canvas-tab-widget");
    
    this.data = await this._fetchData();
    
    // REGISTER YOUR CANVAS WIDGET HERE
    let groupingCanvasWidget = await this._createCanvasWidget('group-chaining-widget');
    this.canvasWidgets.push(groupingCanvasWidget);
    
    this._transferDataToCanvases();
    
    this._addCanvasWidgetsToCanvasTabs();
  
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyActionFromCanvasWidget(action, canvasWidget) {
    lively.notify("Root App received action from" + canvasWidget);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  async _createCanvasWidget(canvasWidgetName) {
    let canvasWidget = await lively.create(canvasWidgetName);
    assertCanvasWidgetInterface(canvasWidget);
    return canvasWidget;
  }
  
  _transferDataToCanvases() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      canvasWidget.setData(this.data);
    })
  }
  
  async _fetchData() {
    let data = await AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA");
    debugger;
    return data;
  }
  
  _addCanvasWidgetsToCanvasTabs(){
    this.canvasWidgets.forEach((canvasWidget) => {
      this.canvasWidgetTabs.addWidget(canvasWidget);
    })
  }
    
}