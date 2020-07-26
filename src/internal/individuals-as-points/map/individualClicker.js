import { InspectAction } from "../common/actions.js"
import d3 from "src/external/d3.v5.js"

export class IndividualClicker {
  
  constructor(map, mapWidget, dataHandler) {
    this.uniqueColoredCanvas = map.uniqueColoredCanvas
    this.interactiveMapCanvas = map.interactiveMapCanvas
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
      let individualId = this.dataHandler.colorToIndividualId[colorKey]
      
      let selectedIndividual
      if (individualId) {
        this.dataHandler.individuals.forEach(individual => {
          if (individual.id === individualId) {
            selectedIndividual = individual
          }
        })
      }
      
      let applyGlobal = true
      let action = new InspectAction(selectedIndividual, applyGlobal, this.dataProcessor, this.colorStore)
      
      this.mapWidget.dispatchEvent(new CustomEvent("individual-inspected", {
        detail: {
          action: action
        },
        bubbles: true
      }))
      
      this.mapWidget.applyAction(action)
    })
  }
  
  deselectSelectedIndividual() {
    if (this.selectedIndividual) {
      this.selectedIndividual = null
      this.dataHandler.setSelectedIndividual(null)
    }
  }
  
  selectIndividual(individual) {
    if (individual) {
      this.selectedIndividual = individual
      this.dataHandler.setSelectedIndividual(individual)
    }
  }
  
}