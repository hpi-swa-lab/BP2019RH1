import SelectAction from "../common/actions/select-action.js"
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
  
  addClick() {
    d3.select(this.interactiveMapCanvas.canvas).on("click", () => {
      debugger
      this.deselectSelectedIndividual()
      
      let mouseX = d3.event.layerX
      let mouseY = d3.event.layerY
      let color = this.uniqueColoredCanvas.context.getImageData(mouseX, mouseY, 1, 1).data
      let colorKey = 'r' + color[0] + 'g' + color[1] + 'b' + color[2] 
      let individualIndex = this.dataHandler.colorToIndividualIndex[colorKey]

      if (individualIndex) {
        this.selectedIndividual = this.dataHandler.individuals[individualIndex]
        this.selectIndividual(this.selectedIndividual)
      }
      
      let applyGlobal = true
      if (this.selectedIndividual) {
        this.mapWidget.applyAction(new SelectAction(this.selectedIndividual, applyGlobal))
      }
    })
  }
  
  deselectSelectedIndividual() {
    if (this.selectedIndividual) {
      this.dataHandler.resetColorToDefault(this.selectedIndividual)
      this.selectedIndividual = null
      this.tooltip.hide()
    }
  }
  
  selectIndividual(individual) {
    if (individual) {
      this.dataHandler.setColorToHighlight(individual)
      this.tooltip.showIndividualInformation(individual)
    }
  }
  
}