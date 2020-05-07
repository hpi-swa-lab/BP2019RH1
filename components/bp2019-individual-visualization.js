import Morph from 'src/components/widgets/lively-morph.js'
import { assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { deepCopy } from '../src/internal/individuals-as-points/common/utils.js'
  
export default class IndividualVisualization extends Morph {
  
  async initialize() {
    this.windowTitle = "Individual visualizations"
    
    this.tabWidget = this.get('#canvas-tab-widget') 
    this.legend = this.get('#legend-widget') 
    this.inspector = this.get('#inspector-widget') 
    this._setUpGlobalControlWidget()
    //this._registerDatasetSelection()
    
    this.colorStore = new ColorStore()
    this.dataProcessor = new DataProcessor()
    this.dataProcessor.setColorStore(this.colorStore)
       
    this.canvasWidgets = this.tabWidget.getContents() 
    this._initializeCanvasWidgets() 
    await this._updateCanvasesWithKenyaData(this) 
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyAction(action) {
    this._applyActionToLegend(action) 
    this._applyActionToInspector(action) 
    this._applyActionToAllCanvasWidgets(action) 
  }
  
  unsavedChanges(){
    if(this.canvasWidgets) this._stopAllCanvasWidgets()
    if(this.globalControlWidget) this.globalControlWidget.close()
    return false
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  async _setUpGlobalControlWidget() {
    let position = lively.pt(1000, 10)
    let extent = lively.pt(300, 700)
    this._setUpControlWidgetButton()
    this.globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
    this.globalControlWidget.setDataProcessor(this.dataProcessor)
    this.globalControlWidget.setColorStore(this.colorStore)
    this.globalControlWidget.addListener(this)
  }
  
  _setUpControlWidgetButton() {
    this.get('#open-global-controls').addEventListener(
      "click", () => this._openNewGlobalControlWidget())
  }
  
  async _openNewGlobalControlWidget() {
    let position = lively.pt(1000, 10)
    let extent = lively.pt(300, 700)
    this.globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
    this.globalControlWidget.setDataProcessor(this.dataProcessor)
    this.globalControlWidget.setColorStore(this.colorStore)
    this.globalControlWidget.addListener(this)
    this.globalControlWidget.initializeAfterDataFetch()
  }
  
  _initializeCanvasWidgets() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      assertCanvasWidgetInterface(canvasWidget) 
      canvasWidget.setDataProcessor(this.dataProcessor)
      canvasWidget.setColorStore(this.colorStore)
      canvasWidget.addListener(this) 
    })
  }
  
  _applyActionToAllCanvasWidgets(action) {
    this.canvasWidgets.forEach((canvasWidget) => {
      canvasWidget.applyActionFromRootApplication(action)
        .catch(() => {}) 
    })
  }
  
  _registerDatasetSelection() {
    let datasetSelection = this.get("#dataset-selection") 
    datasetSelection.addEventListener("change", (evt) => this._changeDataset(evt, this)) 
  }
  
  _changeDataset(evt, that) {
    let datasetName = evt.target.value 
    this._loadDatasetWithName(datasetName, that) 
  }
  
  _loadDatasetWithName(datasetName, that) {
    switch(datasetName) {
      case 'Somalia':
        this._updateCanvasesWithSomaliaData(that) 
        break;
      case 'Kenya':
        this._updateCanvasesWithKenyaData(that) 
        break;
      default:
        break;
    }
  }
  
  _applyActionToInspector(action) {
    this.inspector.applyActionFromRootApplication(action) 
  }
  
  _applyActionToLegend(action){
    this.legend.applyActionFromRootApplication(action) 
  }
  
  async _updateCanvasesWithKenyaData(that) {
    that.data = await that._fetchKenyaData() 
    this.dataProcessor.initializeWithIndividualsFromKenia(that.data) 
    that._initializeColorScales() 
    that._transferDataToCanvases() 
    that._updateGlobalControlWidget() 
  }
  
  async _updateCanvasesWithSomaliaData(that) {
    that.data = await that._fetchSomaliaData() 
    this.dataProcessor.initializeWithIndividualsFromSomalia(that.data) 
    that._initializeColorScales() 
    that._transferDataToCanvases() 
    that._updateGlobalControlWidget() 
  }
  
   _transferDataToCanvases() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      canvasWidget.setData(deepCopy(this.data))
        .catch(() => {}) 
    })
  }
  
  _initializeColorScales(){
    this.colorStore.initializeWithValuesByAttribute(this.dataProcessor.getValuesByAttribute()) 
  }
  
  _updateGlobalControlWidget(){
    this.globalControlWidget.initializeAfterDataFetch()
  }
  
  async _fetchKenyaData() {
    let data = await AVFParser.loadInferredCovidData() 
    return data 
  }
  
  async _fetchSomaliaData() {
    let data = await AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA") 
    return data 
  }
  
  _stopAllCanvasWidgets() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      if(canvasWidget.stop) {
        canvasWidget.stop().catch(() => {})
      }
      
    })
  }
    
}