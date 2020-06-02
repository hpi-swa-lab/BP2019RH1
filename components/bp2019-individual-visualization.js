import Morph from 'src/components/widgets/lively-morph.js'
import { assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { deepCopy } from '../src/internal/individuals-as-points/common/utils.js'

export default class IndividualVisualization extends Morph {
  
  async initialize() {
    this.windowTitle = "Individual visualizations"
    this.headerRow = this.get("#header-row")
    this.tabWidget = this.get('#canvas-tab-widget') 
    this.legend = this.get('#legend-widget') 
    this.inspector = this.get('#inspector-widget') 
    this._setUpGlobalControlWidget()
    this._registerDatasetSelection()
    
    this.colorStore = new ColorStore()
    this.dataProcessor = new DataProcessor()
    this.dataProcessor.setColorStore(this.colorStore)
    
    this._setUpLegend()
    this.canvasWidgets = this.tabWidget.getContents() 
    this._initializeCanvasWidgets()
    this._setCanvasWidgetExtents()
    this._addEventListenerForResizing()
    await this._updateCanvasesWithKenyaData(this) 
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyAction(action) {
    this._applyActionToLegend(action) 
    this._applyActionToInspector(action) 
    this._applyActionToAllCanvasWidgets(action)
    this._setCanvasWidgetExtents()
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
  
  _setUpLegend(){
    this.legend.setColorStore(this.colorStore)
  }
  
  _initializeCanvasWidgets() {
    this.canvasWidgets.forEach( (canvasWidget) => {
      assertCanvasWidgetInterface(canvasWidget) 
      canvasWidget.setDataProcessor(this.dataProcessor)
      canvasWidget.setColorStore(this.colorStore)
      canvasWidget.addListener(this) 
    })
  }
  
  _setCanvasWidgetExtents() {
    let extent = this._calculateVisualizationExtent()
    this.tabWidget.setExtent(extent)
  }
  
  _calculateVisualizationExtent() {
    let ownExtent = lively.getExtent(this)
    let legendExtent = lively.getExtent(this.legend)
    let headerRowExtent = lively.getExtent(this.headerRow)
    let inspectorRootContainer = this.get('#inspector-container')
    let inspectorContainerExtent = lively.getExtent(inspectorRootContainer)
    let margin = lively.pt(10, 10)
    
    return ownExtent.subPt(lively.pt(0, legendExtent.y)).subPt(lively.pt(0, headerRowExtent.y)).subPt(lively.pt(inspectorContainerExtent.x, 0)).subPt(margin)
  }
  
  _addEventListenerForResizing() {
    let container = this.parentElement
    lively.removeEventListener("bp2019", container, "extent-changed")
  
    lively.addEventListener("bp2019", container, "extent-changed", () => {
      this._setCanvasWidgetExtents()
    })
  }
  
  _applyActionToAllCanvasWidgets(action) {
    this.canvasWidgets.forEach((canvasWidget) => {
      canvasWidget.applyAction(action)
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
    this.inspector.applyAction(action) 
  }
  
  _applyActionToLegend(action){
    this.legend.applyAction(action) 
  }
  
  async _updateCanvasesWithKenyaData(that) {
    that.data = await that._fetchKenyaData() 
    this.dataProcessor.initializeWithIndividualsFromKenia(that.data) 
    that._initializeColorScales() 
    await that._transferDataToCanvases() 
    that._updateGlobalControlWidget() 
  }
  
  async _updateCanvasesWithSomaliaData(that) {
    that.data = await that._fetchSomaliaData() 
    this.dataProcessor.initializeWithIndividualsFromSomalia(that.data) 
    that._initializeColorScales() 
    await that._transferDataToCanvases() 
    that._updateGlobalControlWidget() 
  }
  
   async _transferDataToCanvases() {
     for (let i = 0; i < this.canvasWidgets.length; i++) {
       await this.canvasWidgets[i].setData(deepCopy(this.data))
     }
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
    let data = await AVFParser.loadCovidSomDataMessageThemes()
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