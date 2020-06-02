"enable aexpr";

import d3 from 'src/external/d3.v5.js'
import inside from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/npm-point-in-polygon.js"

import Morph from 'src/components/widgets/lively-morph.js';
import FreehandDrawer from '../src/internal/individuals-as-points/common/drawFreehand.js'

import { getRandomInteger, deepCopy, collapse } from "../src/internal/individuals-as-points/common/utils.js"

import { assertListenerInterface, assertFreeHandSelectionListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import { 
  InspectAction, 
  SelectAction,
  FilterAction, 
  ColorAction, 
  GroupAction, 
  NullAction,
  InspectActionType, 
  SelectActionType,
  FilterActionType, 
  ColorActionType, 
  GroupActionType, 
  NullActionType
} from '../src/internal/individuals-as-points/common/actions.js'

var ctx
export default class Bp2019YAxisWidget extends Morph {
  async initialize() {
    ctx = this
    this.name = "yAxisWidget"
    
    this.dataProcessor = undefined
    this.colorStore = undefined
    
    this.individualIndexByIdentifyingColor = undefined
    
    this.listeners = []

    this.container = this.get("#y-axis-widget-root-container")
    this.canvas = this.get("#y-axis-widget-canvas")
    this.drawCanvas = this.get("#drawCanvas")
    this.controlPanel = this.get("#control-widget")
    this.controlPanel.addSizeListener(this)
    
    this.canvas.addEventListener("click", (event) => {this._onCanvasClicked(event)})

    this.canvasPadding = {"left": 50, "top": 10, "right": 10, "bottom": 50}
    
    this.canvas.style.paddingLeft = this.canvasPadding.left + "px"
    this.canvas.style.paddingTop = this.canvasPadding.top + "px"
    this.canvas.style.paddingRight = this.canvasPadding.right + "px"
    this.canvas.style.paddingBottom = this.canvasPadding.bottom + "px"
    
    this.drawCanvas.style.paddingLeft = this.canvasPadding.left + "px"
    this.drawCanvas.style.paddingTop = this.canvasPadding.top + "px"
    this.drawCanvas.style.paddingRight = this.canvasPadding.right + "px"
    this.drawCanvas.style.paddingBottom = this.canvasPadding.bottom + "px"
    
    this.drawer = new FreehandDrawer(this.container, this.drawCanvas)
    this.drawer.addListener(this)
    this.drawer.start()
    
    this.context = this.canvas.getContext("2d")
    
    this.scalesSVG = d3.select(this.get("#scales-svg"))
    
    let xAxisGroup = d3.select(this.get("#x-axis-group"))
    let xScale = d3.scaleBand().padding(0.1)
    
    let yAxisGroup = d3.select(this.get("#y-axis-group"))
    let yScale = d3.scaleBand().padding(0.1)
    
    this.groupingInformation = {
      "attributes": {
        "x": "none",
        "y": "none"
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
  
  async setExtent(extent) {
    lively.setExtent(this, extent)
    lively.setExtent(this.container, extent)
    if (this.data) this._updateExtent()
  }
  
  async setData(data) {
    this.data = data
    
    this.individualIndexByIdentifyingColor = {}
    this.data.forEach(element => {
      this.individualIndexByIdentifyingColor[this.colorStore.convertColorObjectToRGBHexString(element.drawing.identifyingColor)] = element.index
    })
    
    this.activate()
  }
  
  getData(data) {
    return this.data
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  setFreeHandSelectionListener(listener) {
    assertFreeHandSelectionListenerInterface(listener)
    this.freeHandSelectionListener = listener
  }
  
  async applyAction(action) {
    this._dispatchAction(action)
  }
  
  async activate() {
    this._initializeData()
    this.originalData = deepCopy(this.data)
    this.controlWidget.initializeAfterDataFetch()
    this._initializeAxes()
    //this._resetAxes()
    this._runCurrentActions()
    this._draw()
  }
  
  async stop() {
    
  }
  
  onSizeChange() {
    this._updateExtent()
  }
  
  drawFinished(linePoints) {
    let leftPadding = this.canvasPadding.left
    let topPadding = this.canvasPadding.top

    
    this.scalesSVG.selectAll("polygon").remove()
    
    this.scalesSVG.selectAll("polygon")
        .data([linePoints])
      .enter().append("polygon")
        .attr("points",function(d) { 
          return d.map(function(d) {
              return [d.x + leftPadding, d.y + topPadding].join(",");
          }).join(" ");
        })
        .style("fill", "CadetBlue")
        .style("fill-opacity", "0.3")
        .style("stroke", "black")
        .style("stroke-dasharray", "5,5")
        .on("contextmenu", (points) => {
          let event = d3.event
          event.preventDefault()
          event.stopPropagation()
          this._handleFreeHandSelection(points, event)
        })
    
    //spike draggable borders - draw a draggable Point of each point in polygon
    // if dragged update linePoints and call updatePolygon
    /*
    this.linePoints = linePoints 
    let ctx = this
    
    let drag = d3.drag()
        .on('start', this._dragstarted)
        .on('drag', this._dragged)
        .on('end', this._dragended);
    

    this.scalesSVG.selectAll("circle")
        .data(linePoints)
      .enter().append("circle")
        .attr("cx", function (d) { return d.x + leftPadding})
        .attr("cy", function (d) { return d.y + topPadding})
        .attr("r", function (d) { return 3 })
        .style("fill", "black");
    
    this.scalesSVG.selectAll("circle")
      .call(drag)
  }
  
  _dragstarted(d) {
    d3.select(this).raise().classed('active', true);
  }
  
  _dragged(d) {
    d3.select(this)
        .attr('cx', d3.event.x)
        .attr('cy', d3.event.y)
    
    ctx.scalesSVG.select('polygon')
      .data([ctx.linePoints])
      .attr("points", function(d) { 
          return d.map(function(d) {
              return [d.x + ctx.canvasPadding.left, d.y + ctx.canvasPadding.top].join(",");
          }).join(" ");
    })
  }
  
  _dragended(d) {
    d3.select(this).classed('active', false);
  } */
    
  }

  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)
  }
  
  _dispatchAction(action) {
    
    switch(action.getType()) {
      case (GroupActionType):
        this._handleGroupAction(action);
        break;
      case (ColorActionType):
        this._handleColorAction(action);
        break;
      case (SelectActionType):
        this._handleSelectAction(action);
        break;
      case (FilterActionType):
        this._handleFilterAction(action);
        break;
      case (InspectActionType):
        this._handleInspectAction(action)
        break;
      case (NullActionType):
        this._handleNullAction(action)
        break;
      default:
        this._handleNotSupportedAction(action);
    }
    
    this._draw()
  }
  
  _draw() {
    let context = this.canvas.getContext("2d")

    context.save()
    
    let canvasSize = this._getCanvasSize()
    context.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    this._drawGroupingRectangles(context)
    
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
  
  _drawGroupingRectangles(context) {
    // cases: both attributes -> tiles
    // one attribute one none -> stripes
    // one attribute one amount -> bars
    // both none, both amount, one amount one none -> nothing
    
    context.fillStyle = this.colorStore.convertColorObjectToRGBAHexString(this.colorStore.getGroupingRectangleColor())
    
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    
    if (groupingAttributeX === "none" || groupingAttributeY === "none") {
      if (groupingAttributeX === "none" && groupingAttributeY === "none") {
        return
      } else if (groupingAttributeX === "amount" || groupingAttributeY === "amount") {
        return
      } else {
        this._drawGroupingStripes(context)
      }
    } else if (groupingAttributeX === "amount" || groupingAttributeY === "amount") {
      if (groupingAttributeX === "amount" && groupingAttributeY === "amount") {
        return
      } else {
        this._drawGroupingBars(context)
      }
    } else {
      this._drawGroupingTiles(context)
    }
  }
  
  _drawGroupingTiles(context) {
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y
    xScale.domain().forEach(xDomainElement => {
      yScale.domain().forEach(yDomainElement => {
        context.fillRect(xScale(xDomainElement), yScale(yDomainElement), xScale.bandwidth(), yScale.bandwidth())
      })
    })
  }
  
  _drawGroupingStripes(context) {
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y
    if (groupingAttributeX !== "none") {
      xScale.domain().forEach(xDomainElement => {
        context.fillRect(xScale(xDomainElement), 0, xScale.bandwidth(), yScale.range()[0])
        // the range for y is inverted, thats why we take [0]
      })
    } else if (groupingAttributeY !== "none") {
      yScale.domain().forEach(yDomainElement => {
        context.fillRect(0, yScale(yDomainElement), xScale.range()[1], yScale.bandwidth())
      })
    }
  }
  
  _drawGroupingBars(context) {
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y
    
    if (groupingAttributeX !== "amount") {
      let amountsByValues = this._getAmountsByValues(this.currentActions["x"].attribute, xScale.domain())
      xScale.domain().forEach(xDomainElement => {
        context.fillRect(xScale(xDomainElement), yScale(amountsByValues[xDomainElement]), xScale.bandwidth(), yScale.range()[0] - yScale(amountsByValues[xDomainElement]))
      })
    } else if (groupingAttributeY !== "amount") {
      let amountsByValues = this._getAmountsByValues(this.currentActions["y"].attribute, yScale.domain())
      yScale.domain().forEach(yDomainElement => {
        context.fillRect(xScale(amountsByValues[yDomainElement]), yScale(yDomainElement), xScale.range()[0] - xScale(amountsByValues[yDomainElement]) , yScale.bandwidth())
      })
    }
  }
    
  _initializeData() {
    this.data.forEach(individual => {
      let size = individual.drawing.currentSize * 2
      
      individual.drawing.currentPosition = {
        "x": getRandomInteger(size, this._getCanvasSize().width - size),
        "y": getRandomInteger(size, this._getCanvasSize().height - size)
      }
    })
  }
  
  _initializeAxes() {
    let xOffset = this.canvasPadding.left
    let yOffset = this._getCanvasSize().height + this.canvasPadding.top
    
    
    this.groupingInformation.axesGroups.x.attr(
      'transform', 
      `translate(${xOffset}, ${yOffset})`
    )
    this.groupingInformation.axesGroups.y.attr(
      'transform', 
      `translate(${xOffset}, ${this.canvasPadding.top})`
    )
    
    this.groupingInformation.scales.x.range([0, this._getCanvasSize().width - this.canvasPadding.right])
    this.groupingInformation.scales.y.range([this._getCanvasSize().height, 0])
    
    this._updateAxis("x")
    this._updateAxis("y")
  }
  
  _rescaleData(oldExtent, newExtent) {
    this.data.forEach(individual => {
      individual.drawing.currentPosition.x = individual.drawing.currentPosition.x / oldExtent.x * newExtent.x * 1.0
      individual.drawing.currentPosition.y = individual.drawing.currentPosition.y / oldExtent.y *  newExtent.y * 1.0
    })
  }
  
  _resetAxes() {
    Object.keys(this.groupingInformation.axesGroups).forEach(axisName => {
      this.resetAxis(axisName)
    })
  }
  
  _resetAxis(axisName) {
    this.groupingInformation.attributes[axisName] = "none"

    let scale = this.groupingInformation.scales[axisName]
    scale.domain([])
    this._updateAxis(axisName)
  }
  
  _updateAxis(axisName) {
    let scale = this.groupingInformation.scales[axisName]

    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
    } else {
      axis = d3.axisLeft(scale)
    }

    this.groupingInformation.axesGroups[axisName].call(axis)
  }
  
  _handleGroupAction(action) {
    if (action.axis === "x") {
      this.controlWidget.xAxisGroupingWidget.attributeSelect.value = action.attribute
    } else {
      this.controlWidget.yAxisGroupingWidget.attributeSelect.value = action.attribute
    }
    
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
      if (this.groupingInformation.attributes[action.axis] !== "amount") {
        this._handleGroupAction(this.currentActions[otherAxis])
      }
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
    
    if (groupingAttribute === "amount" || groupingAttribute === "none") {
      lively.notify("you cannot get an amount of amounts or randomness")
      return
    }
    
    let values = this.dataProcessor.getValuesForAttribute(groupingAttribute)
    let amountsByValues = this._getAmountsByValues(groupingAttribute, values)
    let maxValue = 0
    maxValue = Math.max(...Object.values(amountsByValues))
    
    this.groupingInformation.scales[axisName] = d3.scaleLinear().domain([0, maxValue]).range(axisName === "x" ? [0, this.canvas.width] : [this.canvas.height, 0])
    let scale = this.groupingInformation.scales[axisName]
    
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
    let values = this._getValuesForAttribute(groupingAttribute)
    
    let axisName = action.axis
    
    this.groupingInformation.scales[axisName] = d3.scaleBand().padding(0.1).domain(axisName === "x" ? values : values.reverse()).range(axisName === "x" ? [0, this.canvas.width] : [this.canvas.height, 0])
    
    
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
    action.runOn(this.data)
  }
  
  _handleFreeHandSelection(linePoints, event) {
    let linePointsArray = linePoints.map(point => [point.x, point.y])
    let selectedPoints = this.data.filter(point => inside([point.drawing.currentPosition.x, point.drawing.currentPosition.y], linePointsArray))
    
    this.dispatchEvent(new CustomEvent("selection-contextmenu", {
      detail: {
        selectedPoints: selectedPoints,
        clientX: event.clientX,
        clientY: event.clientY,
        selectionColor: "CadetBlue"
      },
      bubbles: true
    }))
  }
  
  _handleNullAction(action) {
    
  }
        
  _handleNotSupportedAction(action) {
  
  }
  
  _getAmountsByValues(attribute, values) {
    let amountsByValues = {}
    
    values.forEach(value => {
      amountsByValues[value] = 0
    })
    
    this.data.forEach(individual => {
      let individualValue = this.dataProcessor.getUniqueValueFromIndividual(individual, attribute)
      amountsByValues[individualValue] += 1
    })
    return amountsByValues
  }
  
  _getValuesForAttribute(groupingAttribute) {
    let filterAction = this.currentActions["filter"]
    let values = []
    filterAction.filters.forEach(filter => {
      if (filter.filterAttribute === groupingAttribute) {
        values = values.concat(filter.filterValues)
      }
    })
    if (values.length <= 0) {
      return this.dataProcessor.getValuesForAttribute(groupingAttribute)
    } else {
      return values
    }
  }
  
  _onCanvasClicked(event) {
    this._buildIdentifyingImageData()
    
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
    let rect = this._getCanvasSize()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
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
    
    let colorInt = this.colorStore.convertColorObjectToColorInt(color)
    let colorString = this.colorStore.convertColorIntToRGBHexString(colorInt)

    return colorString
  }
  
  _getIndividualByIdentifyingColor(identifyingColor) {
    let index = this.individualIndexByIdentifyingColor[identifyingColor]
    return this._getIndividualByIndex(index)
  }
  
  _getIndividualByIndex(index) {
    let result
    
    this.data.forEach(individual => {
      if (individual.index == index) {
        result = individual
      }
    })
    
    return result
  }
  
  _buildIdentifyingImageData() {
    this._drawWithIdentifyingColors()
    
    const context = this.canvas.getContext("2d")
    let canvasDimensions = this._getCanvasSize()
    this.identifyingImageData = context.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height)
    
    this._draw()
  }
  
  _isBackgroundColor(color) {
    return color === "#00000000"
  }
  
  _updateExtent() {
    let extent = lively.getExtent(this.get("#canvas-widget-canvas-container"))
    if (extent.x == 0 && extent.y == 0) {
      //canvas widget canvas container is not initialised yet
      extent = lively.getExtent(this.container)
      extent.x = extent.x * 0.65
    }
    
    let oldCanvasExtent = {
      "x": this.canvas.width,
      "y": this.canvas.height,
    }
    
    let newCanvasExtent = {
      "x": extent.x - this.canvasPadding.left - this.canvasPadding.right,
      "y": extent.y - this.canvasPadding.top - this.canvasPadding.bottom,
    }
    
    this.scalesSVG
      .attr("width", extent.x)
      .attr("height", extent.y)
    
    d3.select(this.canvas)
      .attr("width", newCanvasExtent.x)
      .attr("height", newCanvasExtent.y)
    
    d3.select(this.drawCanvas)
      .attr("width", newCanvasExtent.x)
      .attr("height", newCanvasExtent.y)
     
    this._initializeAxes()
    this._rescaleData(oldCanvasExtent, newCanvasExtent)
    this._runCurrentActions()
    
    this._draw()
  }
  
  _getCanvasSize() {
    return {"width": this.canvas.width, "height": this.canvas.height}
  }
  
  _runCurrentActions() {
    Object.keys(this.currentActions).forEach(key => {
      this._dispatchAction(this.currentActions[key])
    })
  }
}