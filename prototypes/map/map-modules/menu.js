import d3 from "src/external/d3.v5.js"

export class Menu {
  
  constructor(colorSelect, colorAttributes, themeSelect, themeAttributes, genderSelect, ageSelect, applyButton, legend, dataHandler, drawingCanvas) {
    this.dataHandler = dataHandler
    this.drawingCanvas = drawingCanvas
    this.colorSelect = colorSelect
    this.themeSelect = themeSelect
    this.ageSelect = ageSelect
    this.genderSelect = genderSelect
    this.colorAttributes = colorAttributes
    this.themeAttributes = themeAttributes
    this.ageAttributes = this.dataHandler.getValuesOfAttribute("age")
    this.genderAttributes = this.dataHandler.getValuesOfAttribute("gender")
    this.applyButton = applyButton
    this.legend = legend
    this.selectedAgeAttributes = []
    this.selectedGenderAttributes = []
  }
  
  create() {
    this.ageAttributes.unshift("all")
    this.genderAttributes.unshift("all")
    
    this.colorAttributes.forEach((attribute) => {
      this.colorSelect.options[this.colorSelect.options.length] = new Option(attribute)
    })
    
    d3.select(this.colorSelect).on("change", () => {
      let selectedAttribute = this.colorSelect.options[this.colorSelect.selectedIndex].value
      
      d3.select(this.themeSelect).style("display", "none")
      d3.select(this.ageSelect).style("display", "none")
      d3.select(this.genderSelect).style("display", "none")
      
      this.clearSelected(this.themeSelect) 
      this.clearSelected(this.ageSelect) 
      this.clearSelected(this.genderSelect)  
      
      if (selectedAttribute === "themes") {
        d3.select(this.themeSelect).style("display", "inline-grid")
      } else if (selectedAttribute == "age") {
        d3.select(this.ageSelect).style("display", "inline-grid")
      } else if (selectedAttribute == "gender") {
        d3.select(this.genderSelect).style("display", "inline-grid")
      }
    })
    
    this.themeAttributes.forEach((attribute) => {
      this.themeSelect.options[this.themeSelect.options.length] = new Option(attribute)
    })
    
    this.ageAttributes.forEach((attribute) => {
      this.ageSelect.options[this.ageSelect.options.length] = new Option(attribute)
    })
    
    this.genderAttributes.forEach((attribute) => {
      this.genderSelect.options[this.genderSelect.options.length] = new Option(attribute)
    })
    
    d3.select(this.ageSelect).on("change", () => {
      this.selectedAgeAttributes = this.getSelectValues(this.ageSelect)
      if (this.selectedAgeAttributes.includes("all")) {
        this.clearSelected(this.ageSelect)
        this.ageSelect.options[0].selected = true
        this.selectedAgeAttributes = []
      }
    })
    
    d3.select(this.genderSelect).on("change", () => {
      this.selectedGenderAttributes =  this.getSelectValues(this.genderSelect)
      if (this.selectedGenderAttributes.includes("all")) {
        this.clearSelected(this.genderSelect)
        this.genderSelect.options[0].selected = true
        this.selectedGenderAttributes = []
      }
    })
    
    this.applyButton.addEventListener("click", () => {
      this.clearLegend()
      this.dataHandler.selectedThemes = null
      let attribute = this.colorSelect.options[this.colorSelect.selectedIndex].value
      let themeAttributes = this.getSelectValues(this.themeSelect)
      
      if (!this.selectedGenderAttributes) {
        this.selectedGenderAttributes = this.genderAttributes
      }
      if (!this.selectedAgeAttributes) {
        this.selectedAgeAttributes = this.ageAttributes
      }

      if (attribute === "themes") {
        this.dataHandler.selectedThemes = themeAttributes
        this.dataHandler.setColorByThemeAttribute()
      } else if (attribute === "age") {
        this.dataHandler.setColorByAttribute(this.selectedAgeAttributes, attribute)
      } else if (attribute === "gender") {
        this.dataHandler.setColorByAttribute(this.selectedGenderAttributes, attribute)
      } else {
        this.dataHandler.setColorByAttribute([], attribute)
      }
      this.createLegend()
      this.drawingCanvas.draw()
    })
  }
  
  getSelectValues(attributeSelect) {
    let result = []
    let options = attributeSelect && attributeSelect.options
    let attributeOption

    for (let i=0; i < options.length; i++) {
      attributeOption = options[i]
      if (attributeOption.selected) {
        result.push(attributeOption.value)
      }
    }
    return result
  }
  
  clear() {
    this.clearLegend()
    d3.select(this.themeSelect).style("display", "none") 
    d3.select(this.ageSelect).style("display", "none")
    d3.select(this.genderSelect).style("display", "none")
    let length = this.themeSelect.options.length
    for (let i = length-1; i >= 0; i--) {
      this.themeSelect.remove(this.themeSelect.options[i])
    }
    length = this.genderSelect.options.length
    for (let i = length-1; i >= 0; i--) {
      this.genderSelect.remove(this.genderSelect.options[i])
    }
    length = this.ageSelect.options.length
    for (let i = length-1; i >= 0; i--) {
      this.ageSelect.remove(this.ageSelect.options[i])
    }
    length = this.colorSelect.options.length
    for (let i = length-1; i >= 0; i--) {
      this.colorSelect.remove(this.colorSelect.options[i])
    }
  }
  
  clearSelected(attributeSelect) {
    let elements = attributeSelect.options

    for(var i = 0; i < elements.length; i++){
      elements[i].selected = false
    }
  }
  
  clearLegend() {
    d3.select(this.legend).selectAll("*").remove()
    this.legend
      .setAttribute("viewBox", "0 0 400 0")
  }
  
  createLegend() {
    this.legend
      .setAttribute("viewBox", "0 0 400 " + this.dataHandler.attributeValues.length * 25)
    
    d3.select(this.legend).selectAll("dots")
      .data(this.dataHandler.attributeValues)
      .enter()
      .append("circle")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 10 + i*25})
        .attr("r", 7)
        .style("fill", (d) => { 
          let color = this.dataHandler.colorMap[d]
          return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")"})
    
    d3.select(this.legend).selectAll("labels")
      .data(this.dataHandler.attributeValues)
      .enter()
      .append("text")
        .attr("x", 30)
        .attr("y", function(d,i){ return 10 + i*25})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
  }
}
