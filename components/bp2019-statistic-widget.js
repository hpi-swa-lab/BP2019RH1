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
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _generateBarChartForKey(key) {
    let barChart = new BarChart(this.data, key, 300, 300)
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
