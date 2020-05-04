import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js"
import DataProcessor from "./data-processor.js"
import ColorStore from './color-store.js'

export default class DistributionBarChart {
  constructor(individuals, key, canvasWidth, canvasHeight) {
    this.individuals = individuals
    this.key = key
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    
    this.canvas = this._generateBarChartCanvas()
    this.ctx = this.canvas.getContext('2d')
    
    this.labels = []
    this.distributionData = {}
    this.barBackgroundColors = []
    
    this._generateBarChart()
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  getBarChartCanvas() {
    return this.canvas
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _generateBarChart() {
    this._generateLabels()
    this._generateDistributionData()
    this._generateBarBackgroundColors()
    this._generateChart()
    
  }
  
  _generateLabels() {
    this.labels = DataProcessor.current().getValuesForAttribute(this.key)
    this.labels.forEach( label => this.distributionData[label] = 0)
  }
  
  _generateDistributionData() {
    this.individuals.forEach( individual => {
      let label = DataProcessor.current().getUniqueValueFromIndividual(individual, this.key)
      this.distributionData[label] += 1
    })
    this.distributionData = Object.keys(this.distributionData).map( key => this.distributionData[key])
  }
  
  _generateBarBackgroundColors() {
      this.barBackgroundColors = this.labels.map(label => ColorStore.current().getColorForValue(this.key, label))
  }
  
  _generateChart() {
    let labels = this.labels
    let barBackgroundColors = this.barBackgroundColors
    let distributionData = this.distributionData
    let myChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '# of individuals',
          data: distributionData,
          backgroundColor: barBackgroundColors
        }]
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            ticks: {
              maxRotation: 90,
              minRotation: 80
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }
  
  _generateBarChartCanvas() {
    let canvas = <canvas></canvas>;
    canvas.width = this.canvasWidth
    canvas.height = this.canvasHeight
    return canvas
  }
}