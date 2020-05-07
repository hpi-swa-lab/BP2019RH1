import Morph from 'src/components/widgets/lively-morph.js'
import BarChart from '../src/internal/individuals-as-points/common/distribution-bar-chart.js'

export default class StatisticWidget extends Morph {
  
  async initialize() {
    this.data = null
    
    this.rootContainer = this.get('#statistic-widget-root-container')
    
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
  
  setData(data) {
    this.data = data
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
  
  unsavedChanges(){
    this.creator.statisticWidgetIsClosed()
    return false
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  
  _generateBarChartForKey(key) {
    let barChart = new BarChart(this.data, key, 300, 300)
    barChart.setDataProcessor(this.dataProcessor)
    barChart.setColorStore(this.colorStore)
    let barChartContainer = this._buildBarChartContainer(barChart)
    this._appendBarChartContainer(barChartContainer)
  }
  
  _buildBarChartContainer(barChart) {
    let barChartCanvas = barChart.getBarChartCanvas()
    let wrapperDiv = <div></div>;
    wrapperDiv.appendChild(barChartCanvas)
    return wrapperDiv
  }
  
  _appendBarChartContainer(barChartContainer) {
    this.rootContainer.appendChild(barChartContainer)
  }
}
