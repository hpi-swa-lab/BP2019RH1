import d3 from "src/external/d3.v5.js"
import { 
  NullAction, 
  ResetAction, 
  GroupingAction, 
  FilterAction, 
  ColoringAction 
} from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/actions.js"

export class Pane {
  
  static deepClone(object) {
    return JSON.parse(JSON.stringify(object))
  }

  static getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }
  
  constructor(div, pointWidth, data, colorMap) {
    this.div = div
    this.controlPanelDiv = {}
    this.controlsDiv = {}
    this.legendDiv = {}
    this.currentScaleAttributeDiv = {}
    this.currentColorAttributeDiv = {}
    this.colorLegendDiv = {}
    this.canvasDiv = {}
    this.scaleSVG = {}
    this.axis = {}
    this.g_axis = {}

    this.deleteButton = {}
    this.actionSelect = {}
    this.attributeSelect = {}
    this.valueSelect = {}
    this.applyActionButton = {}

    this.actions = ["none", "filter", "grouping", "coloring"]
    this.selectedAction = {}
    this.selectedAttribute = {}
    this.selectedValue = {}

    this.canvasMargin = {}
    this.canvasDimensions = {}
    this.canvas = {}

    this.scaleHeight = {}
    this.scale = {}
    
    this.defaultScaleAttribute = {}
    this.currentScaleAttribute = {}
    
    this.defaultColorAttribute = {}
    this.currentColorAttribute = {}
    
    this.pointWidth = pointWidth
    
    this.incomingData = Pane.deepClone(data)
    this.processedData = {}
    
    this.colorMap = colorMap
    
    this.diagram = {}
    this.children = []
    this.parent = null
    this.parentConnection = null
    this.initialize()
  }

  initialize() {
    this.initializeControlPanel()
    this.initializeDiagram()
    
    if (!this.incomingData[0].drawing) {
      this.initializeData()
    }
    this.processedData = Pane.deepClone(this.incomingData)
    
    this.setCurrentDrawingStateAsDefault() 
    this.runSelectedAction()
    this.draw()
  }

  initializeControlPanel() {
    this.controlPanelDiv = <div></div>;
    this.controlPanelDiv.style.width = this.div.getBoundingClientRect().width * 0.25 + "px"
    this.controlPanelDiv.style.height = this.div.getBoundingClientRect().height * 0.95 + "px"
    this.controlPanelDiv.style.float = "left"
    this.controlPanelDiv.style.overflow = "auto"
    
    this.div.appendChild(this.controlPanelDiv)
    
    this.deleteButton = <Button>x</Button>;
    this.deleteButton.addEventListener("click", () => {this.delete()})
    this.controlPanelDiv.appendChild(this.deleteButton)
    
    this.appendButton = <Button>Add subsequent pane</Button>;
    this.appendButton.addEventListener("click", () => {this.registerNewPane()})
    this.controlPanelDiv.appendChild(this.appendButton)
    
    this.controlPanelDiv.appendChild(<br></br>)
    
    this.controlsDiv = <div></div>;
    this.controlsDiv.style.width = this.controlPanelDiv.getBoundingClientRect().width * 0.95 + "px"
    this.controlsDiv.style.height = this.controlPanelDiv.getBoundingClientRect().height * 0.30 + "px"
    this.controlsDiv.style.margin = "0 auto"
    this.controlsDiv.style.display = "table"
        
    this.controlPanelDiv.appendChild(this.controlsDiv)
    
    this.setSelectedAction("none")
    this.actionSelect = <select></select>;
    this.actionSelect.style.margin = "0 auto"
    this.actionSelect.style.display = "table"
    this.actions.forEach(action => {
      this.actionSelect.options[this.actionSelect.options.length] = new Option(action)
    })
    this.actionSelect.addEventListener("change", () => {
      this.setSelectedAction(this.actionSelect.options[this.actionSelect.selectedIndex].value)
      this.setSelectedAttribute(this.attributeSelect.options[this.attributeSelect.selectedIndex].value)
      this.refreshControlPanelBySelectedAction()
    })
    
    this.controlsDiv.appendChild(this.actionSelect)
    
    this.setSelectedAttribute("")
    this.attributeSelect = <select></select>;
    this.attributeSelect.style.margin = "0 auto"
    this.attributeSelect.style.display = "table"
    let exampleObject = Pane.deepClone(this.incomingData[0])
    delete exampleObject.drawing
    Object.keys(exampleObject).forEach(key => {
      this.attributeSelect.options[this.attributeSelect.options.length] = new Option(key)
    })
    this.attributeSelect.addEventListener("change", () => {
      this.setSelectedAttribute(this.attributeSelect.options[this.attributeSelect.selectedIndex].value)
      this.refreshControlPanelBySelectedAttribute()
    })
    
    this.setSelectedValue("")
    this.valueSelect = <select></select>;
    this.valueSelect.style.margin = "0 auto"
    this.valueSelect.style.display = "table"
    this.valueSelect.addEventListener("change", () => {
      this.setSelectedValue(this.valueSelect.options[this.valueSelect.selectedIndex].value)
    })
    
    this.applyActionButton = <button>Apply</button>;
    this.applyActionButton.style.margin = "0 auto"
    this.applyActionButton.style.display = "table"
    this.applyActionButton.addEventListener("click", () => {
      this.runSelectedAction()
    })
    
    this.controlsDiv.appendChild(this.applyActionButton)  
    
    this.legendDiv = <div></div>;
    this.legendDiv.style.width = this.controlPanelDiv.getBoundingClientRect().width * 0.95 + "px"
    this.legendDiv.style.height = this.controlPanelDiv.getBoundingClientRect().height * 0.70 + "px"
    this.legendDiv.style.margin = "0 auto"
    this.legendDiv.style.display = "table"
    
    this.controlPanelDiv.appendChild(this.legendDiv)
    
    this.currentScaleAttributeDiv = <p></p>;
    this.currentScaleAttributeDiv.style.width = this.legendDiv.getBoundingClientRect().width * 0.95 + "px"
    this.currentScaleAttributeDiv.style.height = this.controlPanelDiv.getBoundingClientRect().height * 0.10 + "px"
    
    this.legendDiv.appendChild(this.currentScaleAttributeDiv)
    
    this.currentColorAttributeDiv = <p></p>;
    this.currentColorAttributeDiv.style.width = this.legendDiv.getBoundingClientRect().width * 0.95 + "px"
    this.currentColorAttributeDiv.style.height = this.controlPanelDiv.getBoundingClientRect().height * 0.10 + "px"
    
    this.legendDiv.appendChild(this.currentColorAttributeDiv)
    
    this.setDefaultColorAttribute("")
    this.setCurrentColorAttribute("")
    this.colorLegendDiv = <div></div>;
    this.colorLegendDiv.style.width = this.controlPanelDiv.getBoundingClientRect().width * 0.95 + "px"
    this.colorLegendDiv.style.height = this.controlPanelDiv.getBoundingClientRect().height * 0.75 + "px"
    this.colorLegendDiv.style.margin = "0 auto"
    this.colorLegendDiv.style.display = "table"
    
    this.refreshColorLegend()

    this.legendDiv.appendChild(this.colorLegendDiv)
    
  }
  
  initializeDiagram() {    
    this.canvasDiv = <div></div>;
    this.canvasDiv.style.width = this.div.getBoundingClientRect().width * 0.70 + "px"
    this.canvasDiv.style.height = this.div.getBoundingClientRect().height * 0.60 + "px"
    this.canvasDiv.style.float = "right"  
    this.div.appendChild(this.canvasDiv)
   
    this.canvasMargin = {
      "top": 12, 
      "right": 12, 
      "bottom": 0, 
      "left": 12
    }
    
    this.canvasDimensions = {
      "width": Math.floor(this.canvasDiv.getBoundingClientRect().width - this.canvasMargin.left - this.canvasMargin.right),
      "height": Math.floor(this.canvasDiv.getBoundingClientRect().height - this.canvasMargin.top - this.canvasMargin.bottom)
    }
    
    this.canvas = d3.select(this.canvasDiv).append("canvas")
      .attr("width", this.canvasDimensions.width)
      .attr("height", this.canvasDimensions.height)
      .attr("class", 'canvas-plot')
      .style('margin-left', this.canvasMargin.left + 'px')
      .style('margin-top', this.canvasMargin.top + 'px')
    
    this.setDefaultScaleAttribute("")
    this.setCurrentScaleAttribute("")
    
    this.scaleHeight = this.div.getBoundingClientRect().height * 0.40
    
    this.scaleSVG = d3.select(this.canvasDiv).append('svg')
      .attr('width', this.canvasDiv.getBoundingClientRect().width)
      .attr('height', this.scaleHeight)
      .attr('class', 'svg-plot')
      .attr('transform', `translate(${this.canvasMargin.left}, ${this.canvasMargin.top})`)
    
    this.scale = d3.scaleBand().domain([]).range([0, this.canvasDimensions.width]),
    this.axis = d3.axisBottom(this.scale)
    this.g_axis = this.scaleSVG.append('g').call(this.axis)
  }
  
  initializeData() {
    let colorMap = this.getColorMap()
    this.incomingData.forEach(element => {
      element.drawing = {}
      element.drawing.defaultColor = colorMap["default"]
      element.drawing.currentColor = element.drawing.defaultColor
      element.drawing.currentPosition = {
      "x": Pane.getRandomInteger(0, this.canvasDimensions.width), 
      "y": Pane.getRandomInteger(0, this.canvasDimensions.height)
      }
      element.drawing.defaultPosition = {
      "x": element.drawing.currentPosition.x,
      "y": element.drawing.currentPosition.y
      }
    })
  }
  
  refreshControlPanelBySelectedAction() {
    if (this.getSelectedAction() === "none") {
      this.controlsDiv.removeChild(this.attributeSelect)
      if (this.controlsDiv.contains(this.valueSelect)) {  
        this.controlsDiv.removeChild(this.valueSelect)
      }
      return
    }
    
    this.controlsDiv.removeChild(this.applyActionButton)
    this.controlsDiv.appendChild(this.attributeSelect)
    
    if (this.getSelectedAction() === "filter") {
      this.refreshValueSelectOptions()
      if (!this.controlsDiv.contains(this.valueSelect)) {  
        this.controlsDiv.appendChild(this.valueSelect)
      }
    } else {      
      if (this.controlsDiv.contains(this.valueSelect)) {  
        this.controlsDiv.removeChild(this.valueSelect)
      }
    }
    
    this.controlsDiv.appendChild(this.applyActionButton)
  }
  
  refreshControlPanelBySelectedAttribute() {
    if (this.getSelectedAction() !== "filter") {
      if (this.controlsDiv.contains(this.valueSelect)) {  
        this.controlsDiv.removeChild(this.valueSelect)
      }
      return
    }
    
    this.refreshValueSelectOptions()
    
    this.controlsDiv.removeChild(this.applyActionButton)
    this.controlsDiv.appendChild(this.valueSelect)
    this.controlsDiv.appendChild(this.applyActionButton)
  }
  
  refreshValueSelectOptions() {
    this.removeOptionsOfSelect(this.valueSelect)
    
    let values = this.getValuesOfAttribute(this.getSelectedAttribute())
    values.forEach(value => {
      this.valueSelect.options[this.valueSelect.options.length] = new Option(value)
    })
    
    this.valueSelect.dispatchEvent(new Event("change"))
  }
  
  refreshColorLegend() {
    this.removeChildren(this.colorLegendDiv)
    
    let colorValues = this.getCombinationsOfValuesOfAttribute(this.getCurrentColorAttribute())
    let colorMap = this.getColorMap()
    
    let width = this.colorLegendDiv.getBoundingClientRect().width * 0.97 + "px"
    let height = this.colorLegendDiv.getBoundingClientRect().height * 0.09 + "px"
    
    if (colorValues.length <= 0) {
      let colorRectangle = <div></div>;
      colorRectangle.innerHTML = "default"
      colorRectangle.style.flush = "left"
      colorRectangle.style.background = colorMap["default"]
      colorRectangle.style.width = width
      colorRectangle.style.height = height
      
      this.colorLegendDiv.appendChild(colorRectangle)
    } else {
      colorValues.forEach(value => {
        let colorRectangle = <div></div>;
        colorRectangle.innerHTML = value
        colorRectangle.style.flush = "left"
        colorRectangle.style.background = colorMap[value]
        colorRectangle.style.width = width
        colorRectangle.style.height = height
        colorRectangle.style.overflow = "hidden"
        colorRectangle.style.textOverflow = "ellipsis"

        this.colorLegendDiv.appendChild(colorRectangle)
      })
    }
  }
  
  updateChildren() {
    let data = this.getData()
    let colorMap = this.getColorMap()
    
    let scaleAttribute
    if (this.getSelectedAction() === "grouping") {
      scaleAttribute = this.getCurrentScaleAttribute()
    } else {
      scaleAttribute = this.getDefaultScaleAttribute()
    }
    
    let colorAttribute
    if (this.getSelectedAction() === "coloring") {
      colorAttribute = this.getCurrentColorAttribute()
    } else {
      colorAttribute = this.getDefaultColorAttribute()
    }
    
    this.children.forEach(child => {
      child.setData(data)
      child.setCurrentDrawingStateAsDefault()
      child.setDefaultScaleAttribute(scaleAttribute)
      child.setCurrentScaleAttribute(scaleAttribute)
      child.setDefaultColorAttribute(colorAttribute)
      child.setCurrentColorAttribute(colorAttribute)
      child.setColorMap(colorMap)
      child.setAxisDomain()
      child.runSelectedAction()
    })
  }
  
  runSelectedAction() {
    this.resetDisplay()
    
    let action;
    switch(this.getSelectedAction()) {
      case "none":
        action = new NullAction()
        break
      case "filter":
        action = new FilterAction()
        action.setFilterValue(this.getSelectedValue())
        break
      case "grouping":
        action = new GroupingAction()
        this.setCurrentScaleAttribute(this.getSelectedAttribute())
        this.setAxisDomain()
        break
      case "coloring":
        action = new ColoringAction()
        this.setCurrentColorAttribute(this.getSelectedAttribute())
        action.setColorMap(this.getColorMap())
        break
    }

    action.setAttribute(this.getSelectedAttribute())
    this.runAction(action)
    
    this.draw()
    this.refreshColorLegend()
    
    this.updateChildren()
  }
  
  runAction(action) {
    if (action.groupsData()) {
      this.setPositionsByGroup(action.runOn(this.incomingData))
    } else {
      this.processedData = action.runOn(this.incomingData)
    }
  }
  
  removeOptionsOfSelect(select) {
    while(select.options.length > 0) {
      select.options.remove(0)
    }
  }

  removeChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  removeChild(child) {
    let children = this.getChildren()
    children.splice(children.indexOf(child), 1)
  }
  
  resetDisplay() {
    this.runAction(new ResetAction())
    this.setCurrentScaleAttribute(this.getDefaultScaleAttribute())
    this.setCurrentColorAttribute(this.getDefaultColorAttribute())
    this.refreshColorLegend()
    this.setAxisDomain()
    this.draw()
  }
  
  draw() {
    const context = this.canvas.node().getContext("2d")
    context.save()
    context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height)
    this.processedData.forEach(element => {
      context.fillStyle = element.drawing.currentColor
      context.fillRect(
        element.drawing.currentPosition.x,
        element.drawing.currentPosition.y, 
        this.pointWidth, 
        this.pointWidth
      ) 
    })
    context.restore()
  }
  
  setPositionsByGroup(groups) {
    let values = Object.keys(groups)
    values.forEach(value => {
      let start = this.canvasDimensions.width / values.length * values.indexOf(value)
      groups[value].forEach(element => {
        element.drawing.currentPosition.x = Pane.getRandomInteger(start, start + this.canvasDimensions.width / values.length)
        element.drawing.currentPosition.y = Pane.getRandomInteger(0, this.canvasDimensions.height)
      })
    }) 
  }
  
  addChild(child) {
    this.children.push(child)
  }
  
  registerNewPane() {
    this.diagram.addNewPane(this)
  }
  
  setAxisDomain() {
    let domain = this.getCombinationsOfValuesOfAttribute(this.getCurrentScaleAttribute())
    this.scale.domain(domain)
    this.g_axis
      .call(this.axis)
      .selectAll("text")
        .attr("transform", "translate(-12.5, 10)rotate(-90)")
        .style("text-anchor", "end")
  }
  
  setCurrentDrawingStateAsDefault() {
    this.incomingData.forEach(element => {
      element.drawing.defaultColor = element.drawing.currentColor
      element.drawing.defaultPosition.x = element.drawing.currentPosition.x
      element.drawing.defaultPosition.y = element.drawing.currentPosition.y
    }) 
  }

  setData(data) {
    this.incomingData = Pane.deepClone(data)
  }

  setCurrentScaleAttribute(attribute) {
    this.currentScaleAttribute = attribute
    this.currentScaleAttributeDiv.innerHTML = "Current scale attribute: " + attribute
  }

  setDefaultScaleAttribute(attribute) {
    this.defaultScaleAttribute = attribute
  }
  
  setSelectedAction(action) {
    this.selectedAction = action
  }

  setSelectedValue(value) {
    this.selectedValue = value
  }

  setSelectedAttribute(attribute) {
    this.selectedAttribute = attribute
  }
  
  setDefaultColorAttribute(attribute) {
    this.defaultColorAttribute = attribute
  }
  
  setCurrentColorAttribute(attribute) {
    this.currentColorAttribute = attribute
    this.currentColorAttributeDiv.innerHTML = "Current color attribute: " + attribute
  }
  
  setColorMap(colorMap) {
    this.colorMap = colorMap
  }
  
  setDiagram(diagram) {
    this.diagram = diagram
  }
  
  setParent(pane) {
    this.parent = pane
  }
  
  setParentConnection(parentConnection){
    this.parentConnection = parentConnection
  }
  
  getCombinationsOfValuesOfAttribute(attribute="") {
    if (attribute === "") {
      return []
    }
    
    let values = {}
    this.incomingData.forEach(element => {
      values[element[attribute]] = true
    })
    
    return Object.keys(values)
  }
  
  getValuesOfAttribute(attribute="") {
    if (attribute === "") {
      return []
    }
    
    let arrayAttributes = ["themes", "languages"]
    let values = {}
    if (arrayAttributes.includes(attribute)) {
      this.incomingData.forEach(element => {
        element[attribute].forEach(value => {
          values[value] = true
        })
      })
    } else {
      this.incomingData.forEach(element => {
        values[element[attribute]] = true
      })
    }
    
    return Object.keys(values)
  }
  
  getData() {
    return Pane.deepClone(this.processedData)
  }
  
  getIncomingData() {
    return Pane.deepClone(this.incomingData)
  }

  getCurrentScaleAttribute() {
    return this.currentScaleAttribute
  }
  
  getDefaultScaleAttribute() {
    return this.defaultScaleAttribute
  }

  getSelectedAction() {
    return this.selectedAction
  }

  getSelectedValue() {
    return this.selectedValue
  }

  getSelectedAttribute() {
    return this.selectedAttribute
  }
  
  getDefaultColorAttribute() {
    return this.defaultColorAttribute
  }
  
  getCurrentColorAttribute() {
    return this.currentColorAttribute
  }
  
  getColorMap() {
    return this.colorMap
  }
  
  getDiagram() {
    return this.diagram
  }
  
  getChildren() {
    return this.children
  }
  
  getParent() {
    return this.parent
  }
  
  getParentConnection() {
    return this.parentConnection
  }
  
  getDiv() {
    return this.div
  }
  
  delete() {
    let parent = this.getParent()
    let children = this.getChildren()
    
    if (parent) {
      children.forEach(child => {
        parent.addChild(child)
      })
      parent.removeChild(this)
    }
    
    this.resetDisplay()
    this.updateChildren()
    
    children.forEach(child => {
      child.setParent(parent)
    })
    
    this.getDiagram().removePane(this)
  }
}