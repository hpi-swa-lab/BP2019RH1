import d3 from "src/external/d3.v5.js"

export class IndividualClicker {
  
  constructor(uniqueColoredCanvas, defaultColoredCanvas, tooltip, dataHandler, interactiveMapCanvas) {
    this.uniqueColoredCanvas = uniqueColoredCanvas
    this.defaultColoredCanvas = defaultColoredCanvas
    this.interactiveMapCanvas = interactiveMapCanvas
    this.tooltip = tooltip
    this.dataHandler = dataHandler
    this.selectedIndividual = null
  }
  
  addClick() {
    d3.select(this.defaultColoredCanvas.canvas).on("click", () => {
      let mouseX = d3.event.layerX
      let mouseY = d3.event.layerY
      let color = this.uniqueColoredCanvas.context.getImageData(mouseX, mouseY, 1, 1).data
      let colorKey = 'r' + color[0] + 'g' + color[1] + 'b' + color[2] 
      let individualIndex = this.dataHandler.colorToIndividualIndex[colorKey]

      if (this.selectedIndividual) {
        this.dataHandler.resetColorToDefault(this.selectedIndividual)
      }

      if (individualIndex) {
        this.selectedIndividual = this.dataHandler.individuals[individualIndex]
        this.dataHandler.setColorToHighlight(this.selectedIndividual)

        this.tooltip.showIndividualInformation(this.selectedIndividual)
      } else {
        if (this.selectedIndividual) {
          this.selectedIndividual = null
        }
        this.tooltip.hide()
      }
      this.defaultColoredCanvas.draw()
    })
  }
  
}