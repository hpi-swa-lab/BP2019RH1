import { InspectAction } from "../common/actions.js"
import d3 from "src/external/d3.v5.js"

export class IndividualClicker {
  
  constructor(map, mapWidget, tooltip, dataHandler) {
    this.uniqueColoredCanvas = map.uniqueColoredCanvas
    this.interactiveMapCanvas = map.interactiveMapCanvas
    this.tooltip = tooltip
    this.dataHandler = dataHandler
    this.selectedIndividual = null
    this.map = map
    this.mapWidget = mapWidget
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  addClick() {
    d3.select(this.interactiveMapCanvas.canvas).on("click", () => {
      let mouseX = d3.event.layerX
      let mouseY = d3.event.layerY
      let color = this.uniqueColoredCanvas.context.getImageData(mouseX, mouseY, 1, 1).data
      let colorKey = 'r' + color[0] + 'g' + color[1] + 'b' + color[2] 
      let individualIndex = this.dataHandler.colorToIndividualIndex[colorKey]

      let selectedIndividual
      if (individualIndex) {
        selectedIndividual = this.dataHandler.individuals[individualIndex]
      }
      
      let applyGlobal = true
      this.mapWidget.applyAction(new InspectAction(selectedIndividual, applyGlobal, this.dataProcessor, this.colorStore))
    })
  }
  
  deselectSelectedIndividual() {
    if (this.selectedIndividual) {
      this.selectedIndividual = null
      this.dataHandler.setSelectedIndividual(null)
      this.tooltip.hide()
    }
  }
  
  selectIndividual(individual) {
    if (individual) {
      this.selectedIndividual = individual
      this.dataHandler.setSelectedIndividual(individual)
      this.tooltip.showIndividualInformation(individual)
    }
  }
  
}