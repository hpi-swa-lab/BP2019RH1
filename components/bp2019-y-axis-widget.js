"enable aexpr";

import d3 from 'src/external/d3.v5.js'

import Morph from 'src/components/widgets/lively-morph.js';

import { getRandomInteger, deepCopy } from "../src/internal/individuals-as-points/common/utils.js"

import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import { 
  InspectAction, 
  SelectAction,
  FilterAction, 
  ColorAction, 
  GroupAction, 
  NullAction 
} from '../src/internal/individuals-as-points/common/actions.js'

export default class Bp2019YAxisWidget extends Morph {
  async initialize() {
    this.name = "yAxisWidget"
    
    this.dataProcessor = undefined
    this.colorStore = undefined
    
    this.individualIndexByIdentifyingColor = undefined
    
    this.listeners = []
    
    this.canvas = this.get("#y-axis-widget-canvas")
    //this.renderer = this._createReglContextOnCanvas()
    this.canvas.addEventListener("click", (event) => {this._onCanvasClicked(event)})
    
    this.canvasMargin = {"left": 100, "top": 30, "right": 0, "bottom": 100}
    
    this.canvas.style.marginLeft = this.canvasMargin.left + "px"
    this.canvas.style.marginTop = this.canvasMargin.top + "px"
    
    this.scalesSVG = d3.select(this.get("#scales-svg"))
    this.scalesSVG 
      .attr('width', this.canvas.width + this.canvasMargin.left + this.canvasMargin.right)
      .attr('height', this.canvas.height + this.canvasMargin.bottom + this.canvasMargin.top)
      .attr('class', 'svg-plot')
    
    let xAxisGroup = d3.select(this.get("#x-axis-group"))
    let xScale = d3.scaleBand().padding(0.1)
    
    let yAxisGroup = d3.select(this.get("#y-axis-group"))
    let yScale = d3.scaleBand().padding(0.1)
    
    this.groupingInformation = {
      "attributes": {
        "x": "",
        "y": ""
      },
      "axesGroups": {
        "x": xAxisGroup,
        "y": yAxisGroup
      },
      "scales": {
        "x": xScale,
        "y": yScale
      },
    }
    
    this.currentActions = {
      "x": new NullAction(),
      "y": new NullAction(),
      "color": new NullAction(),
      "filter": new NullAction(),
      "select": new NullAction(),
    }
        
    this.controlWidget = this.get("#control-widget")
    this.controlWidget.addListener(this)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
    this._propagateDataProcessor()
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  async setData(data) {
    this.data = data
    
    this.individualIndexByIdentifyingColor = {}
    this.data.forEach(element => {
      this.individualIndexByIdentifyingColor[this.colorStore.convertColorObjectToRGBAHexString(element.drawing.identifyingColor)] = element.index
    })
    
    this.activate()
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  async applyActionFromRootApplication(action) {
    this._dispatchAction(action)
  }
  
  applyAction(action) {
    if (action.isGlobal) {
      this.listeners.forEach(listener => {
        listener.applyAction(action)
      })
    } else {
      this._dispatchAction(action)
    }
  }
  
  async activate() {
    this._initializeData()
    this.originalData = deepCopy(this.data)
    this.controlWidget.initializeAfterDataFetch()
    this._initializeAxes()
    this._resetAxes()
    this._runCurrentActions()
    this._draw()
  }
  
  async stop() {
    
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)
  }
  
  _dispatchAction(action) {
    switch(true) {
      case (action instanceof GroupAction):
        this._handleGroupAction(action);
        break;
      case (action instanceof ColorAction):
        this._handleColorAction(action);
        break;
      case (action instanceof SelectAction):
        this._handleSelectAction(action);
        break;
      case (action instanceof FilterAction):
        this._handleFilterAction(action);
        break;
      case (action instanceof InspectAction):
        this._handleInspectAction(action)
        break;
      case (action instanceof NullAction):
        this._handleNullAction(action)
        break;
      default:
        this._handleNotSupportedAction(action);
    }
    this._buildIdentifyingImageData()
    this._draw()
  }
  
  _draw() {
    const context = this.canvas.getContext("2d")
    context.save()
    
    let canvasSize = this._getCanvasSize()
    context.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    this.data.forEach(individual => {
      const drawingInformation = individual.drawing
      context.beginPath()
      context.arc(
        drawingInformation.currentPosition.x, 
        drawingInformation.currentPosition.y, 
        drawingInformation.currentSize / 2, 
        0, 
        2 * Math.PI, 
        false
      )
      context.fillStyle = this.colorStore.convertColorObjectToRGBAHexString(drawingInformation.currentColor)
      context.fill()
    })

    context.restore()
  }
  
  _drawWithIdentifyingColors() {
    const context = this.canvas.getContext("2d")
    context.save()
    
    let canvasSize = this._getCanvasSize()
    context.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    this.data.forEach(individual => {
      const drawingInformation = individual.drawing
      context.beginPath()
      context.arc(
        drawingInformation.currentPosition.x, 
        drawingInformation.currentPosition.y, 
        drawingInformation.currentSize / 2, 
        0, 
        2 * Math.PI, 
        false
      )
      context.fillStyle = this.colorStore.convertColorObjectToRGBAHexString(drawingInformation.identifyingColor)
      context.fill()
    })

    context.restore()
  }
  
  _initializeData() {
    this.data.forEach(individual => {
      individual.drawing.currentPosition = {
        "x": getRandomInteger(0, this._getCanvasSize().width),
        "y": getRandomInteger(0, this._getCanvasSize().height)
      }
    })
  }
  
  _initializeAxes() {
    this.groupingInformation.axesGroups.x.attr(
      'transform', 
      `translate(${this.canvasMargin.left - 0.2 * this.canvasMargin.left}, ${this._getCanvasSize().height + this.canvasMargin.top})`
    )
    this.groupingInformation.axesGroups.y.attr(
      'transform', 
      `translate(${this.canvasMargin.left - 0.2 * this.canvasMargin.left}, ${this.canvasMargin.top})`
    )
    this.groupingInformation.scales.x.range([0, this._getCanvasSize().width])
    this.groupingInformation.scales.y.range([0, this._getCanvasSize().height]) 
  }
  
  _resetAxes() {
    Object.keys(this.groupingInformation.axesGroups).forEach(axisName => {
      this._resetAxis(axisName)
    })
  }
  
  _resetAxis(axisName) {
    this.groupingInformation.attributes[axisName] = ""
      
    let scale = this.groupingInformation.scales[axisName]
    scale.domain([])

    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
    } else {
      axis = d3.axisLeft(scale)
    }

    this.groupingInformation.axesGroups[axisName].call(axis)
  }
  
  _handleGroupAction(action) {
    if (action.attribute === "none") {
      this._handleEmptyGroupingAction(action)
    } else if (action.attribute === "amount") {
      this._handleGroupingActionAmount(action)
    } else {
      this._handleGroupingActionAttribute(action)
    }
    
    this.groupingInformation.attributes[action.axis] = action.attribute
    this.currentActions[action.axis] = action
    
    let otherAxis = action.axis === "x" ? "y" : "x"
    if (this.groupingInformation.attributes[otherAxis] === "amount") {
      this._handleGroupAction(this.currentActions[otherAxis])
    }
  }
  
  _handleEmptyGroupingAction(action) {
    let axisName = action.axis    
    this._resetAxis(axisName)
    let canvasSize = this._getCanvasSize()
    
    this.data.forEach(individual => {
      individual.drawing.currentPosition[axisName] = getRandomInteger(0, axisName === "x" ? canvasSize.width : canvasSize.height)
    })
  }
  
  _handleGroupingActionAmount(action) {
    let axisName = action.axis
    let otherAxis = axisName === "x" ? "y" : "x"
    let groupingAttribute = this.groupingInformation.attributes[otherAxis]
    
    if (groupingAttribute === "amount" || groupingAttribute === "") {
      lively.notify("you cannot get an amount of amounts or randomness")
      return
    }
    
    let values = this.dataProcessor.getValuesForAttribute(groupingAttribute)
    let amountsByValues = {}
    let maxValue = 0
    values.forEach(value => {
      amountsByValues[value] = 0
    })
    
    this.data.forEach(individual => {
      let individualValue = this.dataProcessor.getUniqueValueFromIndividual(individual, groupingAttribute)
      amountsByValues[individualValue] += 1
      maxValue = Math.max(maxValue, amountsByValues[individualValue])
    })
    
    let scale = d3.scaleLinear().domain([0, maxValue]).range(axisName === "x" ? [0, this.canvas.width] : [this.canvas.height, 0])
    
    this.data.forEach(individual => {
      let individualValue = this.dataProcessor.getUniqueValueFromIndividual(individual, groupingAttribute)
      if (axisName === "x") {
        individual.drawing.currentPosition[axisName] = getRandomInteger(0, scale(amountsByValues[individualValue]))
      } else {
        individual.drawing.currentPosition[axisName] = getRandomInteger(scale(amountsByValues[individualValue]), this.canvas.height)
      }
    })
    
    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
    } else {
      axis = d3.axisLeft(scale)
    }
    
    this.groupingInformation.axesGroups[axisName].call(axis)
    if (axisName === "x") {
      this.groupingInformation.axesGroups[axisName].selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");
    }
  }
  
  _handleGroupingActionAttribute(action) {
    let groupingAttribute = action.attribute
    let values = this.dataProcessor.getValuesForAttribute(groupingAttribute)
    
    let axisName = action.axis
    
    this.groupingInformation.scales[axisName].domain(axisName === "x" ? values : values.reverse())
    
    let scale = this.groupingInformation.scales[axisName]
    let bandwidth = this.groupingInformation.scales[axisName].bandwidth()
    
    this.data.forEach(individual => {
      let individualValue = this.dataProcessor.getUniqueValueFromIndividual(individual, groupingAttribute)
      individual.drawing.currentPosition[axisName] = scale(individualValue) + getRandomInteger(0, bandwidth)
    })
    
    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
    } else {
      axis = d3.axisLeft(scale)
    }
    
    this.groupingInformation.axesGroups[axisName].call(axis)
    if (axisName === "x") {
      this.groupingInformation.axesGroups[axisName].selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");
    }
  }
       
  _handleColorAction(action) {
    this.data = action.runOn(this.data)
    
    this.currentActions["color"] = action
  }
        
  _handleFilterAction(action) {
    this.data = deepCopy(this.originalData)
    
    Object.keys(this.currentActions).forEach(key => {
      if (key !== "filter") {
        this._dispatchAction(this.currentActions[key])
      }
    })  
    
    this.data = action.runOn(this.data)
    
    this.currentActions["filter"] = action
  }
        
  _handleSelectAction(action) {
    action.runOn(this.data)
    this.currentActions["select"] = action 
  }
  
  _handleInspectAction(action) {
    
  }
  
  _handleNullAction(action) {
    
  }
        
  _handleNotSupportedAction(action) {
  
  }
  
  _onCanvasClicked(event) {
    let clickPosition = this._getCursorPosition(event)
    let identifyingColor = this._getIdentifyingColor(clickPosition)
    
    let individual
    if (!this._isBackgroundColor(identifyingColor)) {
      individual = this._getIndividualByIdentifyingColor(identifyingColor)
    } 
    
    let action = new InspectAction(individual, true, this.dataProcessor, this.colorStore)
    this.applyAction(action)
  }
  
  _getCursorPosition(event) {
    let rect = this.getCanvasSize()
    const x = event.clientX - rect.left - this.canvasMargin.left
    const y = event.clientY - rect.top - this.canvasMargin.top
    return {"x": Math.floor(x), "y": Math.floor(y)}
  }
  
  _getIdentifyingColor(position) {
    let startPosition = (position.y * this.identifyingImageData.width + position.x) * 4
    let color = {
      "r": this.identifyingImageData.data[startPosition],
      "g": this.identifyingImageData.data[startPosition+1],
      "b": this.identifyingImageData.data[startPosition+2],
      "opacity": this.identifyingImageData.data[startPosition+3]
    }
    let colorString = this.colorStore.convertColorObjectToRGBAHexString(color)
    return colorString
  }
  
  _getIndividualByIdentifyingColor(identifyingColor) {
    let index = this.individualIndexByIdentifyingColor[identifyingColor]
    return this.data[index]
  }
  
  _buildIdentifyingImageData() {
    this._drawWithIdentifyingColors()
    
    const context = this.canvas.node().getContext("2d")
    let canvasDimensions = this._getCanvasSize()
    this.identifyingImageData = context.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height)
    
    this._draw()
  }
  
  _getCanvasSize() {
    return this.canvas.getBoundingClientRect()
  }
  
  _runCurrentActions() {
    Object.keys(this.currentActions).forEach(key => {
      this._dispatchAction(this.currentActions[key])
    })
  }
}