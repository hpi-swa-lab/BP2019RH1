import Morph from 'src/components/widgets/lively-morph.js';
import { assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { deepCopy } from '../src/internal/individuals-as-points/common/utils.js'

import { deepCopy } from 'https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/utils.js'
  
export default class IndividualVisualization extends Morph {
  
  async initialize() {
    this.windowTitle = "Individual visualizations"
    
    this.tabWidget = this.get('#canvas-tab-widget');
    this.legend = this.get('#legend-widget');
    this.inspector = this.get('#inspector-widget')
    
    this.canvasWidgets = this.tabWidget.getContents();
    this._initializeCanvasWidgets();
    this._updateCanvasesWithKenyaData(this);
    
    this._registerDatasetSelection();
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyAction(action) {
    this._applyActionToLegend(action);
    this._applyActionToInspector(action);
    this._applyActionToAllCanvasWidgets(action);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
   _initializeCanvasWidgets() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      assertCanvasWidgetInterface(canvasWidget);
      canvasWidget.addListener(this);
    })
  }
  
  _applyActionToAllCanvasWidgets(action) {
    this.canvasWidgets.forEach((canvasWidget) => {
      canvasWidget.applyActionFromRootApplication(action);
    })
  }
  
  _registerDatasetSelection() {
    let datasetSelection = this.get("#dataset-selection");
    datasetSelection.addEventListener("change", (evt) => this._changeDataset(evt, this));
  }
  
  _changeDataset(evt, that) {
    let datasetName = evt.target.value;
    this._loadDatasetWithName(datasetName, that);
  }
  
  _loadDatasetWithName(datasetName, that) {
    switch(datasetName) {
      case 'Somalia':
        this._updateCanvasesWithSomaliaData(that);
        break;
      case 'Kenya':
        this._updateCanvasesWithKenyaData(that);
        break;
      default:
        break;
    }
  }
  
  _applyActionToInspector(action) {
    this.inspector.applyActionFromRootApplication(action);
  }
  
  _applyActionToLegend(action){
    this.legend.applyActionFromRootApplication(action);
  }
  
  async _updateCanvasesWithKenyaData(that) {
    that.data = await that._fetchKenyaData();
    DataProcessor.initializeWithIndividualsFromKenia(that.data);
    that._initializeColorScales();
    that._transferDataToCanvases();
  }
  
  async _updateCanvasesWithSomaliaData(that) {
    that.data = await that._fetchSomaliaData();
    DataProcessor.initializeWithIndividualsFromSomalia(that.data);
    that._initializeColorScales();
    that._transferDataToCanvases();
  }
  
   _transferDataToCanvases() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      canvasWidget.setData(deepCopy(this.data));
    })
  }
  
  _createDeepCopyOfData() {
    let newDataArray = []
    this.data.forEach( object => {
      newDataArray.push(deepCopy(object))
    })
  }
  
  _initializeColorScales(){
    ColorStore.initializeWithValuesByAttribute(DataProcessor.getValuesByAttribute());
  }
  
  async _fetchKenyaData() {
    let data = await AVFParser.loadInferredCovidData();
    return data;
  }
  
  async _fetchSomaliaData() {
    let data = await AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA");
    return data;
  }
    
}