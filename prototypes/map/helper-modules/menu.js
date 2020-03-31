import d3 from "src/external/d3.v5.js"

export class Menu {
  
  constructor(colorSelect, colorAttributes, themeSelect, themeAttributes, applyButton, dataHandler, drawingCanvas) {
    this.colorSelect = colorSelect
    this.themeSelect = themeSelect
    this.applyButton = applyButton
    this.themeAttributes = themeAttributes
    this.colorAttributes = colorAttributes
    this.dataHandler = dataHandler
    this.drawingCanvas = drawingCanvas
  }
  
  create() {
    this.colorAttributes.forEach((attribute) => {
      this.colorSelect.options[this.colorSelect.options.length] = new Option(attribute)
    })
    
    d3.select(this.colorSelect).on("change", () => {
      if (this.colorSelect.options[this.colorSelect.selectedIndex].value === "themes") {
        d3.select(this.themeSelect).style("display", "inline")
      } else {
        d3.select(this.themeSelect).style("display", "none")
      }
    })
    
    this.themeAttributes.forEach((attribute) => {
      this.themeSelect.options[this.themeSelect.options.length] = new Option(attribute)
    })
    
    this.applyButton.addEventListener("click", () => {
      let attribute = this.colorSelect.options[this.colorSelect.selectedIndex].value
      let themeAttribute = this.themeSelect.options[this.themeSelect.selectedIndex].value
      if (attribute !== "themes") {
        this.dataHandler.setColorByAttribute(attribute)
      } else {
        this.dataHandler.setColorByThemeAttribute(themeAttribute)
      }
      this.drawingCanvas.draw()
    })
  }
}