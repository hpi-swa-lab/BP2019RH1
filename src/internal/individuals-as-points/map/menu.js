import d3 from "src/external/d3.v5.js"

export class Menu {
  
  constructor(menuDiv, legend, colorAttributes, themeAttributes, dataHandler, drawingCanvas) {
    this.dataHandler = dataHandler
    this.drawingCanvas = drawingCanvas
    this.colorAttributes = colorAttributes
    this.themeAttributes = themeAttributes
    this.legend = legend
    this.menuDiv = menuDiv
    this.selectedValues = {}
  }
  
  create() {
    this.createSelects()
    this.createApplyButton()
    this.getAttributeOptions()
    this.createSelectOptions()
    this.addEventListenerToColorSelect()
    this.addEventListenerToValueSelects()
    this.addEventListenerToApplyButton()
  }
  
  createSelects() {
    this.selection = lively.query(this.menuDiv, "#bp2019-map-control-widget-selection")
    this.legendDiv = lively.query(this.menuDiv, "#bp2019-map-control-widget-legend-div")
    
    this.colorSelect = document.createElement('select')
    this.colorSelect.id = "color-select"
    this.selection.insertBefore(this.colorSelect, this.legendDiv)
    
    this.colorAttributes.forEach(attribute => {
      let select = document.createElement('select')
      select.id = attribute + "-select"
      select.class = "select"
      select.multiple = true
      d3.select(select).style("display", "none")
      this.selection.insertBefore(select, this.legendDiv)
    })    
  }
  
  createApplyButton() {
    this.applyButton = document.createElement('button')
    this.applyButton.id = "apply-button"
    this.applyButton.innerHTML = "Apply"
    this.selection.insertBefore(this.applyButton, this.legendDiv)
  }
  
  getAttributeOptions() {
    this.attributeOptions = {}
    this.colorAttributes.forEach(attribute => {
      let options
      if(attribute !== "themes") {
        options = this.dataHandler.getValuesOfAttribute(attribute)
      } else {
        options = this.themeAttributes
      }
      
      if (options.length > 0) {
        options.sort()
        this.attributeOptions[attribute] = options
      } else {
        this.attributeOptions[attribute] = []
      }
    })
  }
  
  createSelectOptions() {
    this.colorAttributes.forEach(attribute => {
      this.colorSelect.options[this.colorSelect.options.length] = new Option(attribute)
    })
    
    Object.keys(this.attributeOptions).forEach(key => {
      let select = lively.query(this.menuDiv, "#" + key + "-select")
      select.options[0] = new Option("all")
      this.attributeOptions[key].forEach(option => {
        select.options[select.options.length] = new Option(option)
      }) 
      
      if (select.options.length > 10) {
        select.size = "10"
      } else {
        select.size = select.options.length
      }

    })
  }
  
  addEventListenerToColorSelect() {
    d3.select(this.colorSelect).on("change", () => {
      let selectedAttribute = this.colorSelect.options[this.colorSelect.selectedIndex].value
      
      this.makeSelectsInvisible()
      
      this.clearSelected() 
      
      this.colorAttributes.forEach(attribute => {
        if (selectedAttribute === attribute) {
          let select = lively.query(this.menuDiv, "#" + attribute + "-select")
          d3.select(select).style("display", "inline-grid")
        }
      })
    })
  }
  
  addEventListenerToValueSelects() {
    Object.keys(this.attributeOptions).forEach(key => {
      let select = lively.query(this.menuDiv, "#" + key + "-select")
      d3.select(select).on("change", () => {
        this.selectedValues[key] = this.getSelectValues(select)
        if (this.selectedValues[key].includes("all")) {
          this.clearSelected()
          select.options[0].selected = true
          this.selectedValues[key] = []
        }
      })
    })
  }
  
  addEventListenerToApplyButton() {
    this.applyButton.addEventListener("click", () => {
      this.clearLegend()
      this.dataHandler.selectedThemes = null
      let selectedAttribute = this.colorSelect.options[this.colorSelect.selectedIndex].value
      
      this.colorAttributes.forEach(attribute => {
        if (!this.selectedValues[attribute]) {
          this.selectedValues[attribute] = this.attributeOptions[attribute]
        }
      })
      
      if (selectedAttribute === "themes") {
        this.dataHandler.selectedThemes = this.selectedValues["themes"]
        this.dataHandler.setColorByThemeAttribute()
      } else if (this.colorAttributes.includes(selectedAttribute)) {
        this.dataHandler.setColorByAttribute(this.selectedValues[selectedAttribute], selectedAttribute)
      } else {
        this.dataHandler.setColorByAttribute([], selectedAttribute)
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
    this.makeSelectsInvisible()
    this.colorAttributes.forEach(attribute => {
      let select = lively.query(this.menuDiv, "#" + attribute + "-select")
      this.selection.removeChild(select)
    })
    this.selection.removeChild(this.colorSelect)
    this.selection.removeChild(this.applyButton)
  }
  
  makeSelectsInvisible() {
    this.colorAttributes.forEach(attribute => {
        let select = lively.query(this.menuDiv, "#" + attribute + "-select")
        d3.select(select).style("display", "none")
    })
  }
  
  clearSelected() {
    Object.keys(this.attributeOptions).forEach(key => {
      let select = lively.query(this.menuDiv, "#" + key + "-select")
      let elements = select.options

      for(var i = 0; i < elements.length; i++){
        elements[i].selected = false
      } 
    })
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