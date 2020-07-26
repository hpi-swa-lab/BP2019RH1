import Morph from 'src/components/widgets/lively-morph.js'
import BarChart from '../src/internal/individuals-as-points/common/distribution-bar-chart.js'

import { FilterActionType } from '../src/internal/individuals-as-points/common/actions.js'

import { deepCopy } from "../src/internal/individuals-as-points/common/utils.js"

export default class StatisticWidget extends Morph {
  
  async initialize() {
    this.data = null
    
    this.rootContainer = this.get('#statistic-widget-root-container')
    
    this.currentActions = {}
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setCreator(creator) {
    this.creator = creator
  }
  
  async setData(data) {
    this.data = data
    this.originalData = data
    this._buildAllBarCharts()
  }

  addBarChartForKeys(keys) {
    keys.forEach( key => {
      this.addBarChartForKey(key)
    })
  }
  
  addBarChartForKey(key) {
    this._generateBarChartForKey(key)
  }
  
  close() {
    if(this.parentElement) this.parentElement.remove()
  }
  
  unsavedChanges() {
    if (this.creator) {
      this.creator.statisticWidgetIsClosed()
    }
    return false
  }
  
  setExtent(extent) {
    lively.setExtent(this.rootContainer, extent)
  }
  
  applyAction(action) {
    this._dispatchAction(action)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _clear() {
    while(this.rootContainer.firstChild) {
      this.rootContainer.removeChild(this.rootContainer.firstChild)
    }
  }
  
   _dispatchAction(action) {
    switch(action.getType()) {
      case (FilterActionType):
        this._handleFilterAction(action)
        break
      default:
        this._handleNotSupportedAction()
     }
  }
  
  _handleFilterAction(action) {
    this.data = deepCopy(this.originalData)
    this.data = action.runOn(this.data)
    this._buildAllBarCharts()
    this.currentActions["filter"] = action
  }
  
  _handleNotSupportedAction() {
    
  }
  
  _buildAllBarCharts() {
    this._clear()
    let attributes = this.dataProcessor.getAllAttributes()
    attributes.splice(attributes.indexOf("themes"), 1)
    this.addBarChartForKeys(attributes)
  }
  
  _generateBarChartForKey(key) {
    let barChart = new BarChart(this.data, key, 300, 300, this)
    barChart.setDataProcessor(this.dataProcessor)
    barChart.setColorStore(this.colorStore)
    let barChartContainer = this._buildBarChartContainer(barChart)
    this._appendBarChartContainer(barChartContainer)
  }
  
  _buildBarChartContainer(barChart) {
    let barChartCanvas = barChart.generateCanvas()
    let wrapperDiv = <div></div>;
    wrapperDiv.appendChild(barChartCanvas)
    return wrapperDiv
  }
  
  _appendBarChartContainer(barChartContainer) {
    this.rootContainer.appendChild(barChartContainer)
  }
}
