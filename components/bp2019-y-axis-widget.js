"enable aexpr";

import d3 from 'src/external/d3.v5.js'
import inside from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/npm-point-in-polygon.js"

import Morph from 'src/components/widgets/lively-morph.js';
import FreehandDrawer from '../src/internal/individuals-as-points/common/drawFreehand.js'

import { 
  getRandomInteger, 
  deepCopy, 
} from "../src/internal/individuals-as-points/common/utils.js"

import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import { 
  InspectAction, 
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
    this.strokeStyle = false
    
    this.individualIdByIdentifyingColor = undefined
    
    this.listeners = []

    this.container = this.get("#y-axis-widget-root-container")
    this.canvas = this.get("#y-axis-widget-canvas")
    this.drawSVG = this.get("#draw-svg")
    this.rectangleSVG = this.get("#rectangle-svg")
    this.controlPanel = this.get("#control-widget")
    this.controlPanelContainer = this.get("#canvas-widget-control-panel-container")
    this.controlPanel.addSizeListener(this)
    
    this.canvas.addEventListener("click", (event) => {this._onCanvasClicked(event)})
    
    this.canvasPadding = {"left": 50, "top": 10, "right": 10, "bottom": 50}
    
    this.canvas.style.paddingLeft = this.canvasPadding.left + "px"
    this.canvas.style.paddingTop = this.canvasPadding.top + "px"
    this.canvas.style.paddingRight = this.canvasPadding.right + "px"
    this.canvas.style.paddingBottom = this.canvasPadding.bottom + "px"
        
    this.drawer = new FreehandDrawer(this.container, this.canvas, this.drawSVG)
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
      "inspect": new NullAction()
    }
    this.collapsed = false 
        
    this.controlWidget = this.get("#control-widget")
    this.controlWidget.addListener(this)
    this.controlWidget.addSizeListener(this)
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
  
  setContainerType(type) {
    this.containerType = type
  }
  
  async setExtent(extent) {
    lively.setExtent(this, extent)
    lively.setExtent(this.container, extent)
    if (this.data) this._updateExtent()
    if (this.containerType === "pane") {
      this.setLocalControls()
    }
  }
  
  async setData(data) {
    this.data = data
    
    this.individualIdByIdentifyingColor = {}
    this.data.forEach(element => {
      this.individualIdByIdentifyingColor[this.colorStore.convertColorObjectToRGBHexString(element.drawing.identifyingColor)] = element.id
    })
    
    this.drawer.deleteSelections()
    
    this.activate()
  }
  
  getData() {
    return this.data
  }
  
  setStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
  }
  
  updateStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
    this._draw()
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  async applyAction(action) {
    if (action.id !== "localActionsVenn") {
      this._dispatchAction(action)
    }
  }
  
  async activate() {
    this._initializeData()
    this.originalData = deepCopy(this.data)
    this.controlWidget.initializeAfterDataFetch()
    this._initializeAxes()
    this._runCurrentActions()
     
    this._draw()
  }
  
  async stop() {
    
  }
  
  onSizeChange(collapsed) {
    this.collapsed = collapsed
    this._updateLocalControlsExtent()
  }
  
 freehandSelectionCreated() {
    this._draw()
    this.drawer.drawSelections()
  }
  
  freehandSelectionDeleted(selection) {
    this._draw()
    this.drawer.drawSelections()

    this.dispatchEvent(new CustomEvent("freehand-selection-deleted", {
      detail: {
        selection: selection
      },
      bubbles: true
    }))
  }
  
  freehandSelectionOnContextMenu(evt, selection, selectionSVG) {
    let linePointsArray = selection.linePoints.map(point => [point.x, point.y])
    let selectedIndividuals = this.data.filter(point => inside([point.drawing.currentPosition.x, point.drawing.currentPosition.y], linePointsArray))
    
    this.dispatchEvent(new CustomEvent("freehand-selection-contextmenu", {
      detail: {
        freehandSelectionSVGElement: selectionSVG,
        clientX: evt.clientX,
        clientY: evt.clientY,
        individualsSelection: {selectedIndividuals: selectedIndividuals, selectionColor: selection.color}
      },
      bubbles: true
    }))
  }
  
  setLocalControls() {
    this.unsetLocalControls()
    
    var myWindow = lively.findWindow(this)
    if (myWindow.isWindow) {
      myWindow.get(".window-content").style.overflow = "visible"
    }

    this.controlPanelContainer.style.display = "block"
    
    let parentPosition = lively.getGlobalPosition(this)

    lively.setGlobalPosition(this.controlPanelContainer, 
          parentPosition.addPt(lively.pt(lively.getExtent(this.parentElement).x, 0)));  

    this.controlPanelContainer.style.zIndex = 20000;    
  }
  
  unsetLocalControls() {
    // this.controlPanelContainer.remove()
    this.controlPanelContainer.style.display = "none";
  }

  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _propagateDataProcessor() {
    this.controlWidget.setDataProcessor(this.dataProcessor)
  }
  
  _dispatchAction(action) {
    /*let skip = false
    
    Object.keys(this.currentActions).forEach(actionName => {
      if (action === this.currentActions[actionName]) skip = true
    })
    
    if (skip) return*/
    
    switch(action.getType()) {
      case (GroupActionType):
        this._handleGroupingAction(action);
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
    this._drawGroupingRectangles()
    
    this.context.save()
    
    let canvasSize = this._getCanvasSize()
    this.context.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    this.data.forEach(individual => {
      this.context.beginPath()
      this.context.arc(
        individual.drawing.currentPosition.x, 
        individual.drawing.currentPosition.y, 
        individual.drawing.currentSize / 2, 
        0, 
        2 * Math.PI, 
        false
      )
      
      let color = this.colorStore.convertColorObjectToRGBAHexString(individual.drawing.currentColor)
      if (this.strokeStyle) {
        this.context.strokeStyle = color
        this.context.stroke()
      } else {
        this.context.fillStyle = color
        this.context.fill()
      }
    })

    this.context.restore()
  }
  
  _drawWithIdentifyingColors() {
    this.context.save()
    
    let canvasSize = this._getCanvasSize()
    this.context.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    this.data.forEach(individual => {
      this.context.beginPath()
      this.context.arc(
        individual.drawing.currentPosition.x, 
        individual.drawing.currentPosition.y, 
        individual.drawing.currentSize / 2, 
        0, 
        2 * Math.PI, 
        false
      )
      this.context.fillStyle = this.colorStore.convertColorObjectToRGBAHexString(individual.drawing.identifyingColor)
      this.context.fill()
    })

    this.context.restore()
  }
  
  _drawGroupingRectangles() {
    /*cases: 
        both attributes -> tiles
        one attribute one none -> stripes
        one attribute one amount -> bars
        both none, both amount, one amount one none -> nothing*/
    d3.select(this.rectangleSVG).selectAll('*').remove()
    
    let fillColor = this.colorStore.convertColorObjectToRGBAHexString(this.colorStore.getGroupingRectangleColor())
    
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    
    if (groupingAttributeX === "none" || groupingAttributeY === "none") {
      if (groupingAttributeX === "none" && groupingAttributeY === "none") {
        this._drawDefaultBackgroundShade(fillColor)
      } else if (groupingAttributeX === "amount" || groupingAttributeY === "amount") {
        this._drawDefaultBackgroundShade(fillColor)
      } else {
        this._drawGroupingStripes(fillColor)
      }
    } else if (groupingAttributeX === "amount" || groupingAttributeY === "amount") {
      if (groupingAttributeX === "amount" && groupingAttributeY === "amount") {
        this._drawDefaultBackgroundShade(fillColor)
      } else {
        this._drawGroupingBars(fillColor)
      }
    } else {
      this._drawGroupingTiles(fillColor)
    }
  }
  
  _drawDefaultBackgroundShade(fillColor) {
    let canvasSize = this._getCanvasSize()
    
    d3.select(this.get("#scales-svg")).selectAll(".xtitle").remove()
    d3.select(this.get("#scales-svg")).selectAll(".ytitle").remove()
    
    d3.select(this.rectangleSVG).append("rect")
      .attr("x", 1 + this.canvasPadding["left"])
      .attr("y", 1 + this.canvasPadding["top"])
      .attr("width", canvasSize.width - 1)
      .attr("height", canvasSize.height - 1)
      .attr("fill", fillColor)
  }
  
  _drawGroupingTiles(fillColor) {
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y

    xScale.domain().forEach(xDomainElement => {
      yScale.domain().forEach(yDomainElement => {
        
        d3.select(this.rectangleSVG).append("rect")
          .attr("x", xScale(xDomainElement) + this.canvasPadding["left"])
          .attr("y", yScale(yDomainElement) + this.canvasPadding["top"])
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", fillColor)
      })
    })
  }
  
  _drawGroupingStripes(fillColor) {
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y
    if (groupingAttributeX !== "none") {
      d3.select(this.get("#scales-svg")).selectAll(".ytitle").remove()
      xScale.domain().forEach(xDomainElement => {
        
        d3.select(this.rectangleSVG).append("rect")
          .attr("x", xScale(xDomainElement) + this.canvasPadding["left"])
          .attr("y", 1 + this.canvasPadding["top"])
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.range()[0]) // the range for y is inverted, thats why we take [0]
          .attr("fill", fillColor)

      })
    } else if (groupingAttributeY !== "none") {
      d3.select(this.get("#scales-svg")).selectAll(".xtitle").remove()
      yScale.domain().forEach(yDomainElement => {
        
        d3.select(this.rectangleSVG).append("rect")
          .attr("x", 1 + this.canvasPadding["left"])
          .attr("y", yScale(yDomainElement) + this.canvasPadding["top"])
          .attr("width", xScale.range()[1])
          .attr("height", yScale.bandwidth())
          .attr("fill", fillColor)
      })
    }
  }
  
  _drawGroupingBars(fillColor) {
    let groupingAttributeX = this.groupingInformation.attributes.x
    let groupingAttributeY = this.groupingInformation.attributes.y
    let xScale = this.groupingInformation.scales.x
    let yScale = this.groupingInformation.scales.y
    
    if (groupingAttributeX !== "amount") {
      let amountsByValues = this._getAmountsByValues(this.currentActions["x"].attribute, xScale.domain()
        )
      xScale.domain().forEach(xDomainElement => {
        d3.select(this.rectangleSVG).append("rect")
          .attr("x", xScale(xDomainElement) + this.canvasPadding["left"])
          .attr("y", yScale(amountsByValues[xDomainElement]) + this.canvasPadding["top"])
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.range()[0] - yScale(amountsByValues[xDomainElement]))
          .attr("fill", fillColor)
      })
    } else if (groupingAttributeY !== "amount") {
      let amountsByValues = this._getAmountsByValues(this.currentActions["y"].attribute, yScale.domain())
      yScale.domain().forEach(yDomainElement => {
        d3.select(this.rectangleSVG).append("rect")
          .attr("x", /*xScale(amountsByValues[yDomainElement]) + */this.canvasPadding["left"])
          .attr("y", yScale(yDomainElement) + this.canvasPadding["top"])
          .attr("width", xScale.range()[0] + xScale(amountsByValues[yDomainElement]))
          .attr("height", yScale.bandwidth())
          .attr("fill", fillColor)
      })
    }
  }
    
  _initializeData() {
    this.data.forEach(individual => {
      let offset = individual.drawing.currentSize / 2
      
      individual.drawing.currentPosition = {
        "x": getRandomInteger(offset, this._getCanvasSize().width - offset),
        "y": getRandomInteger(offset, this._getCanvasSize().height - offset)
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
    
    this.groupingInformation.scales.x.range([0, this._getCanvasSize().width])
    this.groupingInformation.scales.y.range([this._getCanvasSize().height, 0])
    
    this._updateAxis("x")
    this._updateAxis("y")
  }
  
  _rescaleData(oldExtent, newExtent) {
    this._calculateNewPositions(this.data, oldExtent, newExtent)
    this._calculateNewPositions(this.originalData, oldExtent, newExtent)
    this.drawer.applyScaling({x: newExtent.x / oldExtent.x * 1.0, y: newExtent.y / oldExtent.y * 1.0})
  }
  
  _calculateNewPositions(data, oldExtent, newExtent) {
    data.forEach(individual => {
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

    this.groupingInformation.scales[axisName] = d3.scaleBand().padding(0.1).domain([]).range(axisName === "x" ? [0, this.canvas.width] : [this.canvas.height, 0])
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
  
  _handleGroupingAction(action) {
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
    this.currentActions[action.axis] = deepCopy(action)
    
    let otherAxis = action.axis === "x" ? "y" : "x"
    if (this.groupingInformation.attributes[otherAxis] === "amount") {
      if (this.groupingInformation.attributes[action.axis] !== "amount") {
        this._handleGroupingAction(this.currentActions[otherAxis])
      }
    }
    
    // this needs to be sent after update of this.currentActions
    this._signalLocalActionsChanged()
  }
  
  _signalLocalActionsChanged(){
    this.dispatchEvent(new CustomEvent("local-actions-changed", {
      detail: {
        localActions: [this.currentActions.x, this.currentActions.y, this.currentActions.inspect]
      },
      bubbles: true
    }))
  }
  
  _handleEmptyGroupingAction(action) {
    let axisName = action.axis    
    this._resetAxis(axisName)
    let canvasSize = this._getCanvasSize()
    
    this.data.forEach(individual => {
      let offset = individual.drawing.currentSize / 2
      individual.drawing.currentPosition[axisName] = getRandomInteger(offset, axisName === "x" ? canvasSize.width - offset : canvasSize.height - offset)
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
      let offset = individual.drawing.currentSize / 2
      if (axisName === "x") {
        individual.drawing.currentPosition[axisName] = getRandomInteger(offset, scale(amountsByValues[individualValue]) - offset)
      } else {
        individual.drawing.currentPosition[axisName] = getRandomInteger(offset + scale(amountsByValues[individualValue]), this.canvas.height - offset)
      }
    })
    
    this._setAxisAnnotations(axisName)
  }
  
  _handleGroupingActionAttribute(action) {
    let groupingAttribute = action.attribute
    let values = this._getValuesForAttribute(groupingAttribute)
    
    let axisName = action.axis
    
    this.groupingInformation.scales[axisName] = d3.scaleBand().padding(0.1).domain(axisName === "x" ? values : values.reverse()).range(axisName === "x" ? [0, this.canvas.width] : [this.canvas.height, 0])
    
    let scale = this.groupingInformation.scales[axisName]
    let bandwidth = this.groupingInformation.scales[axisName].bandwidth()
    
    this.data.forEach(individual => {
      let offset = individual.drawing.currentSize / 2
      let individualValue = this.dataProcessor.getUniqueValueFromIndividual(individual, groupingAttribute)
      individual.drawing.currentPosition[axisName] = scale(individualValue) + getRandomInteger(offset, bandwidth)
    })
    
    this._setAxisAnnotations(axisName)
    
  }
       
  _handleColorAction(action) {    
    this.data = action.runOn(this.data)
    
    this.currentActions["color"] = deepCopy(action)
  }
        
  _handleFilterAction(action) {
    this.data = deepCopy(this.originalData)
    this.data = action.runOn(this.data)
    
    Object.keys(this.currentActions).forEach(key => {
      if (key !== "filter") {
        this._dispatchAction(this.currentActions[key])
      }
    })  
     
    this.currentActions["filter"] = deepCopy(action)
  }
        
  _handleSelectAction(action) {    
    action.runOn(this.data)
    this.currentActions["select"] = deepCopy(action)
  }
  
  _handleInspectAction(action) {    
    action.runOn(this.data)
    this.currentActions["inspect"] = deepCopy(action)
  }
  
  _handleNullAction(action) {
    
  }
        
  _handleNotSupportedAction(action) {
  
  }
  
  _setAxisAnnotations(axisName) {
    let canvasSize = this._getCanvasSize()
    let groupingAttribute = this.currentActions[axisName].attribute
    let scale = this.groupingInformation.scales[axisName]
    
    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
      d3.select(this.get("#scales-svg")).selectAll(".xtitle").remove() 
      this.scalesSVG.append("text")
        .attr("class", "xtitle")
        .attr("text-anchor", "end")
        .attr("x", canvasSize.width + 50)
        .attr("y", canvasSize.height + 50)
        .text(groupingAttribute)
    } else {
      axis = d3.axisLeft(scale)
      d3.select(this.get("#scales-svg")).selectAll(".ytitle").remove() 
      this.scalesSVG.append("text")
        .attr("class", "ytitle")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -20)
        .text(groupingAttribute)
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
      if (filter.filterAttribute === "index") {
        this.data.forEach(individual => {
          let value = this.dataProcessor.getUniqueValueFromIndividual(individual, groupingAttribute)
          if (!values.includes(value)) {
            values = values.concat(value)
          }
          
        })
        values.sort()
      }
      
      if (filter.filterAttribute === groupingAttribute) {
        values = values.concat(filter.filterValues)
      }
    })
    
    if (values.length <= 0) {
      return this.dataProcessor.getValuesForAttribute(groupingAttribute).slice()
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
    
    let inspectAction = new InspectAction(individual, true, this.dataProcessor, this.colorStore)
  
    this.dispatchEvent(new CustomEvent("individual-inspected", {
      detail: {
        action: inspectAction
      },
      bubbles: true
    }))
    
    this.applyAction(inspectAction)
  }
  
  _getCursorPosition(event) {
    // layerX and layerY are the mouse coordinates on the scalesSVG
    const x = event.layerX - this.canvasPadding.left
    const y = event.layerY - this.canvasPadding.top
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
    let id = this.individualIdByIdentifyingColor[identifyingColor]
    let result
    
    this.data.forEach(individual => {
      if (individual.id == id) {
        result = individual
      }
    })
    
    return result
  }
  
  _buildIdentifyingImageData() {
    this._drawWithIdentifyingColors()
    
    let canvasDimensions = this._getCanvasSize()
    this.identifyingImageData = this.context.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height)
    
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
    
    d3.select(this.rectangleSVG)
      .attr("width", extent.x)
      .attr("height", extent.y)
    
    d3.select(this.drawSVG)
      .attr("width", extent.x)
      .attr("height", extent.y)
    
    d3.select(this.canvas)
      .attr("width", newCanvasExtent.x)
      .attr("height", newCanvasExtent.y)
    
    this._initializeAxes()
    this._setAxisAnnotations("x")
    this._setAxisAnnotations("y")
    
    this._rescaleData(oldCanvasExtent, newCanvasExtent)
    this._runCurrentActions()
    
    this._draw()
    
    this._updateLocalControlsExtent()
    
    if (this.contaianerType === "pane") {
      this.setLocalControls()
    }
  }
  
  _updateLocalControlsExtent() {
    let canvasSize = this._getCanvasSize()
    
    if(!this.collapsed) {
      lively.setExtent(this.controlPanelContainer, lively.pt(200, canvasSize.height))
    } else {
      lively.setExtent(this.controlPanelContainer, lively.pt(40, canvasSize.height))
    }
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