import d3 from "src/external/d3.v5.js"
import { 
  NullAction, 
  ResetAction, 
  GroupingAction, 
  FilterAction, 
  ColoringAction 
} from "./actions.js"

export class Pane {
  
  static deepClone(object) {
    return JSON.parse(JSON.stringify(object))
  }

  static getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }
  
  constructor(div, pointWidth, data, colorMap, paneWidth, paneHeight) {
    this.container = div
    this.div = <div></div>
    this.breakLine = <div></div>
    this.childrenDiv = <div></div>
    this.controlPanelDiv = <div></div>
    this.controlsDiv = <div></div>
    this.legendDiv = <div></div>
    this.currentScaleAttributeDiv = <p></p>   
    this.currentColorAttributeDiv = <p></p>
    this.colorLegendDiv = <div></div>
    this.canvasDiv = <div></div>;
    this.axis = {}
    this.g_axis = {}

    this.deleteButton = <Button>x</Button>
    this.appendButton = <Button>Add subsequent pane</Button>
    this.actionSelect = <select></select>
    this.attributeSelect = <select></select>
    this.valueSelect = <select></select>
    this.applyActionButton = <button>Apply</button>

    this.actions = ["none", "filter", "grouping", "coloring"]
    this.selectedAction = {}
    this.selectedAttribute = {}
    this.selectedValue = {}

    this.canvasMargin = {}
    this.canvasDimensions = {}
    this.canvas = d3.select(this.canvasDiv).append("canvas")
    this.scaleSVG = d3.select(this.canvasDiv).append('svg')

    this.scaleHeight = {}
    this.scale = {}
    
    this.defaultScaleAttribute = {}
    this.currentScaleAttribute = {}
    
    this.defaultColorAttribute = {}
    this.currentColorAttribute = {}
    
    this.pointWidth = pointWidth
    this.div.style.width = paneWidth
    this.div.style.height = paneHeight
    
    this.groupGapSize = 10
    
    this.incomingData = Pane.deepClone(data)
    this.processedData = {}
    
    this.colorMap = colorMap
    
    this.diagram = {}
    this.children = []
    this.parent = null
    this.parentConnection = null
    this.initialize()
    
    this.container.appendChild(this.div)
    this.container.appendChild(this.breakLine)
    this.container.appendChild(this.childrenDiv)
    
    this.div.appendChild(this.controlPanelDiv)
    this.div.appendChild(this.canvasDiv)
    
    this.controlPanelDiv.appendChild(this.deleteButton)
    this.controlPanelDiv.appendChild(this.appendButton)
    this.controlPanelDiv.appendChild(<br></br>)
    
    this.controlPanelDiv.appendChild(this.controlsDiv)
    
    this.controlsDiv.appendChild(this.actionSelect)
    this.controlsDiv.appendChild(this.applyActionButton)
    
    this.controlPanelDiv.appendChild(this.legendDiv)
    
    this.legendDiv.appendChild(this.currentScaleAttributeDiv)
    this.legendDiv.appendChild(this.currentColorAttributeDiv)
    this.legendDiv.appendChild(this.colorLegendDiv)
    
  }

  initialize() {

    this.div.style.border = "1px solid black"
    this.div.style.margin = "20px"
  
    this.breakLine.style.flexBasis = "100%"
    this.breakLine.style.height = "0px";
       
    this.childrenDiv.style.display = "flex"
    this.childrenDiv.style.flexDirection = "row"
    this.childrenDiv.style.height = "auto"
    this.childrenDiv.style.width = "auto"
    
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
    this.controlPanelDiv.style.width = this.getPixelValueFromString(this.div.style.width) * 0.25 + "px"
    this.controlPanelDiv.style.height = this.getPixelValueFromString(this.div.style.height) * 0.95 + "px"
    this.controlPanelDiv.style.float = "left"
    this.controlPanelDiv.style.overflow = "auto"
    
    this.deleteButton.addEventListener("click", () => {this.delete()})
    this.appendButton.addEventListener("click", () => {this.registerNewPane()})

    this.controlsDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.controlsDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.30 + "px"
    this.controlsDiv.style.margin = "0 auto"
    this.controlsDiv.style.display = "table"
    
    this.setSelectedAction("none")
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
    
    this.setSelectedAttribute("")
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
    this.valueSelect.style.margin = "0 auto"
    this.valueSelect.style.display = "table"
    this.valueSelect.addEventListener("change", () => {
      this.setSelectedValue(this.valueSelect.options[this.valueSelect.selectedIndex].value)
    })
    
    this.applyActionButton.style.margin = "0 auto"
    this.applyActionButton.style.display = "table"
    this.applyActionButton.addEventListener("click", () => {
      this.runSelectedAction()
    })
    
    this.legendDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.legendDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.70 + "px"
    this.legendDiv.style.margin = "0 auto"
    this.legendDiv.style.display = "table"
    
    this.currentScaleAttributeDiv.style.width = this.getPixelValueFromString(this.legendDiv.style.width) * 0.95 + "px"
    this.currentScaleAttributeDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.10 + "px"

    this.currentColorAttributeDiv.style.width = this.getPixelValueFromString(this.legendDiv.style.width) * 0.95 + "px"
    this.currentColorAttributeDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.10 + "px"
    
    this.setDefaultColorAttribute("")
    this.setCurrentColorAttribute("")
    this.colorLegendDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.colorLegendDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.75 + "px"
    this.colorLegendDiv.style.margin = "0 auto"
    this.colorLegendDiv.style.display = "table"
    
    this.refreshColorLegend()
  }
  
  initializeDiagram() {   
    this.canvasDiv.style.width = this.getPixelValueFromString(this.div.style.width) * 0.70 + "px"
    this.canvasDiv.style.height = this.getPixelValueFromString(this.div.style.height) * 0.60 + "px"
    this.canvasDiv.style.float = "right"  
   
    this.canvasMargin = {
      "top": 12, 
      "right": 12, 
      "bottom": 0, 
      "left": 12
    }
    
    this.canvasDimensions = this.calculateCanvasDimensions()
    
    this.canvas
      .attr("width", this.canvasDimensions.width)
      .attr("height", this.canvasDimensions.height)
      .attr("class", 'canvas-plot')
      .style('margin-left', this.canvasMargin.left + 'px')
      .style('margin-top', this.canvasMargin.top + 'px')
    
    this.setDefaultScaleAttribute("")
    this.setCurrentScaleAttribute("")
    
    this.scaleHeight = this.getPixelValueFromString(this.div.style.height) * 0.40
    
    this.scaleSVG 
      .attr('width', this.getPixelValueFromString(this.canvasDiv.style.width))
      .attr('height', this.scaleHeight)
      .attr('class', 'svg-plot')
      .attr('transform', `translate(${this.canvasMargin.left}, ${this.canvasMargin.top})`)
    
    this.scale = d3.scaleBand().domain([]).range([0, this.canvasDimensions.width])
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
  
  refreshDivSizes() {
    this.controlPanelDiv.style.width = this.getPixelValueFromString(this.div.style.width) * 0.25 + "px"
    this.controlPanelDiv.style.height = this.getPixelValueFromString(this.div.style.height) * 0.95 + "px"

    this.controlsDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.controlsDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.30 + "px"
    
    this.legendDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.legendDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.70 + "px"
    
    this.currentScaleAttributeDiv.style.width = this.getPixelValueFromString(this.legendDiv.style.width) * 0.95 + "px"
    this.currentScaleAttributeDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.10 + "px"

    this.currentColorAttributeDiv.style.width = this.getPixelValueFromString(this.legendDiv.style.width) * 0.95 + "px"
    this.currentColorAttributeDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.10 + "px"
    
    this.colorLegendDiv.style.width = this.getPixelValueFromString(this.controlPanelDiv.style.width) * 0.95 + "px"
    this.colorLegendDiv.style.height = this.getPixelValueFromString(this.controlPanelDiv.style.height) * 0.75 + "px"
   
    
    this.refreshColorLegend()
    
    this.canvasDiv.style.width = this.getPixelValueFromString(this.div.style.width) * 0.70 + "px"
    this.canvasDiv.style.height = this.getPixelValueFromString(this.div.style.height) * 0.60 + "px"
    
    this.canvasDimensions = this.calculateCanvasDimensions()
    
    this.canvas
      .attr("width", this.canvasDimensions.width)
      .attr("height", this.canvasDimensions.height)
    
    this.scaleHeight = this.getPixelValueFromString(this.div.style.height) * 0.40
    
    this.scaleSVG 
      .attr('width', this.getPixelValueFromString(this.canvasDiv.style.width))
      .attr('height', this.scaleHeight)
      .attr('class', 'svg-plot')
      .attr('transform', `translate(${this.canvasMargin.left}, ${this.canvasMargin.top})`)
    
    this.scale = d3.scaleBand().domain([]).range([0, this.canvasDimensions.width])
    this.axis = d3.axisBottom(this.scale)
    this.g_axis.call(this.axis)
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
  
  refreshAttributeSelectOptions() {
    this.removeOptionsOfSelect(this.attributeSelect)
    
    let exampleObject = Pane.deepClone(this.incomingData[0])
    delete exampleObject.drawing
    Object.keys(exampleObject).forEach(key => {
      this.attributeSelect.options[this.attributeSelect.options.length] = new Option(key)
    })
    
    this.attributeSelect.dispatchEvent(new Event("change"))
  }
  
  refreshAttributeSelectOptionsRecursively() {
    this.refreshAttributeSelectOptions()
    
    this.getChildren().forEach(child => {
      child.refreshAttributeSelectOptionsRecursively()
    })
  }
  
  refreshColorLegend() {
    this.removeChildren(this.colorLegendDiv)
    
    let colorValues = this.getCombinationsOfValuesOfAttribute(this.getCurrentColorAttribute())
    let colorMap = this.getColorMap()
    
    let width = this.getPixelValueFromString(this.colorLegendDiv.style.height) * 0.97 + "px"
    let height = this.getPixelValueFromString(this.colorLegendDiv.style.height) * 0.09 + "px"
    
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
    this.childrenDiv.removeChild(child.getContainer())
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
  
  updateSize(newWidth, newHeight) {
    this.div.style.width = newWidth
    this.div.style.height = newHeight
    this.refreshDivSizes()
    this.children.forEach(child => {
      child.updateSize(newWidth, newHeight)
    })
  }
  
  setPositionsByGroup(groups) {
    let groupGapSize = this.getGroupGapSize()
    let values = Object.keys(groups)
    values.forEach(value => {
      let start = this.canvasDimensions.width / values.length * values.indexOf(value) + (groupGapSize / 2)
      groups[value].forEach(element => {
        element.drawing.currentPosition.x = Pane.getRandomInteger(start, start + this.canvasDimensions.width / values.length - groupGapSize)
        element.drawing.currentPosition.y = Pane.getRandomInteger(0, this.canvasDimensions.height)
      })
    }) 
  }
  
  addChild(child) {
    this.children.push(child)
    this.childrenDiv.appendChild(child.getContainer())
  }
  
  registerNewPane() {
    
    let newDiv = <div></div>;
    newDiv.style.height = "auto";
    newDiv.style.width =  "auto";
    newDiv.style.margin = "0 auto";
    newDiv.style.display = "flex";
    newDiv.style.flexDirection = "row";
    newDiv.style.flexWrap = "wrap";
    newDiv.style.justifyContent = "center";
    
    this.childrenDiv.appendChild(newDiv)

    let pane = new Pane(newDiv, this.pointWidth, this.getData(), this.getColorMap(), this.getDiv().style.width, this.getDiv().style.height);
    this.addChild(pane);
    this.getDiagram().addConnection(this, pane);
    
    this.redrawAllConnectionsInDiagram()
    
    pane.setParent(this);
    pane.setDiagram(this.getDiagram()); 
  }
  
  redrawAllConnectionsInDiagram() {
    // connections should only be redrawn after DOM elements have been repainted (addConnection can move up to every DOM element on the canvas)
    let diagram = this.getDiagram()
    requestAnimationFrame(function(){diagram.redrawConnections();});
  }
  
  calculateCanvasDimensions() {
      return {
        "width": Math.floor(this.getPixelValueFromString(this.canvasDiv.style.width) - this.canvasMargin.left - this.canvasMargin.right),
        "height": Math.floor(this.getPixelValueFromString(this.canvasDiv.style.height) - this.canvasMargin.top - this.canvasMargin.bottom) 
      }
  }
  
  removeConnectionsToChildren() {
    let diagram = this.getDiagram()
    let children = this.getChildren()
    
    children.forEach(child => {
      diagram.removeConnection(child.getParentConnection())
    })
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
  
  setDataRecursively(data) {
    this.setData(data)
    
    this.getChildren().forEach(child => {
      child.setDataRecursively(data)
    })
  }
  
  setData(data) {
    this.incomingData = Pane.deepClone(data)
    if (!this.incomingData[0].drawing) {
      this.initializeData()
    }
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
  
  setGroupGapSize(size) {
    this.groupGapSize = size
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
  
  getPixelValueFromString(pixelString) {
    let result = pixelString.replace(/px$/,"")
    return parseInt(result)
  }
  
  getContainer() {
    return this.container
  }
  
  getGroupGapSize() {
    return this.groupGapSize
  }
  
  //deletion with all children (transitively) deleted as well
  
  delete() {
    this.removeAllConnections()
    
    let parent = this.getParent()
    let diagram = this.getDiagram()
    
    if (parent) {
      parent.removeChild(this)
    } else {
      diagram.removePane(this)
    }
    
    this.redrawAllConnectionsInDiagram()
  }
  
  removeAllConnections() {
    this.getChildren().forEach(child => {
      child.removeAllConnections()
    })
    
    let diagram = this.getDiagram()
    diagram.removeConnection(this.getParentConnection())
  }
  
  //deletion with adding the own children to the own parent
  
  /*delete() {
    let parent = this.getParent()
    let diagram = this.getDiagram()
    
    this.removeConnectionsToChildren()
    
    if (parent) {
      this.moveChildrenToParent()
      parent.removeChild(this)
      diagram.removeConnection(this.getParentConnection())
    } else {
      this.moveChildrenToDiagram()
      diagram.removePane(this)
    }
    
    this.redrawAllConnectionsInDiagram()
    
    this.resetDisplay()
    this.updateChildren()   
  }
  
  moveChildrenToParent() {
    let parent = this.getParent()
    let children = this.getChildren()
    let diagram = this.getDiagram()
    
    children.forEach(child => {
      parent.addChild(child)
      child.setParent(parent)
      diagram.addConnection(parent, child)
    })  
  }
  
  moveChildrenToDiagram() {
    let parent = this.getParent()
    let children = this.getChildren()
    let diagram = this.getDiagram()
    
    children.forEach(child => {
      diagram.addPane(child)
      child.setParent(parent)
    })
  }*/
}