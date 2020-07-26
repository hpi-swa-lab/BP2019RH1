import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js"

export default class DistributionBarChart {
  constructor(individuals, key, canvasWidth, canvasHeight, visualization=undefined) {
    this.dataProcessor = undefined
    this.colorStore = undefined
    
    this.visualization = visualization
    this.individuals = individuals
    this.key = key
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    
    this.canvas = this._generateBarChartCanvas()
    this.ctx = this.canvas.getContext('2d')
    
    this.labels = []
    this.distributionData = {}
    this.barBackgroundColors = []
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  generateCanvas() {
    this._generateBarChart()
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
    this.labels = this.dataProcessor.getValuesForAttribute(this.key)
    this.labels.forEach(label => this.distributionData[label] = 0)
  }
  
  _generateDistributionData() {
    this.individuals.forEach( individual => {
      let label = this.dataProcessor.getUniqueValueFromIndividual(individual, this.key)
      if (!this.distributionData[label]) {
        this.distributionData[label] = []
      }
      this.distributionData[label].push(individual)
    })
  }
  
  _generateBarBackgroundColors() {
    this.barBackgroundColors = this.labels.map(label => this.colorStore.getColorForValue(this.key, label))
    this.barBackgroundColors = this.barBackgroundColors.map(backgroundColor => this.colorStore.convertColorObjectToRGBAHexString(backgroundColor))
  }
  
  _generateChart() {
    new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: '# of individuals',
          data: Object.keys(this.distributionData).map(key => this.distributionData[key].length),
          backgroundColor: this.barBackgroundColors,
        }]
      },
      options: {
        title: {
          display: true,
          text: this.key
        },
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
        },
        onClick: (event, activeChartElements) => {
          if(!this.visualization) return;
          
          let clickedBar = activeChartElements[0]
          if(!clickedBar) return;
                        
          this.visualization.dispatchEvent(new CustomEvent("freehand-selection-contextmenu", {
            detail: {
              freehandSelectionSVGElement: undefined,
              clientX: event.clientX,
              clientY: event.clientY,
              individualsSelection: {
                selectedIndividuals: this.distributionData[clickedBar._model.label], 
                selectionColor: clickedBar._model.backgroundColor}
            },
            bubbles: true
          }))
        }
      }
    })
  }
  
  _generateBarChartCanvas() {
    let canvas = <canvas></canvas>;
    canvas.width = this.canvasWidth
    canvas.height = this.canvasHeight
    return canvas
  }
}