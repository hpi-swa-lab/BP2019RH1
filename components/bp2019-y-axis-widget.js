"enable aexpr";

import d3 from 'src/external/d3.v5.js'

import Morph from 'src/components/widgets/lively-morph.js';

import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { ReGL } from "../src/internal/individuals-as-points/common/regl-point-wrapper.js"
import { getRandomInteger, deepCopy } from "../src/internal/individuals-as-points/common/utils.js"

import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import SelectAction from '../src/internal/individuals-as-points/common/actions/select-action.js'
import FilterAction from '../src/internal/individuals-as-points/common/actions/filter-action.js'
import ColorAction from '../src/internal/individuals-as-points/common/actions/color-action.js'
import GroupAction from '../src/internal/individuals-as-points/common/actions/group-action.js'

export default class Bp2019YAxisWidget extends Morph {
  async initialize() {
    this.name = "yAxisWidget"
    
    this.listeners = []
    
    this.canvas = this.get("#y-axis-widget-canvas")
    this.renderer = this._createReglContextOnCanvas()
    
    this.canvasMargin = {"left": 100, "top": 30, "right": 0, "bottom": 30}
    
    this.canvas.style.marginLeft = this.canvasMargin.left + "px"
    this.canvas.style.marginTop = this.canvasMargin.top + "px"
    
    this.scalesSVG = d3.select(this.get("#scales-svg"))
    this.scalesSVG 
      .attr('width', this.canvas.getBoundingClientRect().width + this.canvasMargin.left + this.canvasMargin.right)
      .attr('height', this.canvas.getBoundingClientRect().height + this.canvasMargin.bottom + this.canvasMargin.top)
      .attr('class', 'svg-plot')
    
    let xAxisGroup = d3.select(this.get("#x-axis-group"))
    let xScale = d3.scaleBand().padding(0.2)
    
    let yAxisGroup = d3.select(this.get("#y-axis-group"))
    let yScale = d3.scaleBand().padding(0.2)
    
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
      }
    }
        
    this.controlWidget = this.get("#control-widget")
    this.controlWidget.addListener(this)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setData(data) {
    this.data = data
    this.originalData = deepCopy(this.data)
    this._initializeData()
    this.controlWidget.initializeAfterDataFetch()
    this._resetAxes()
    this._draw()
  }
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  applyActionFromRootApplication(action) {
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
  
  activate() {
    this._initializeData()
    this._initializeAxes()
    this._resetAxes()
    this._draw()
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _dispatchAction(action) {
    debugger
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
      default:
        this._handleNotSupportedAction(action);
    }
    this._draw()
  }
  
  _draw() {
    this.renderer.drawPoints({
      pointWidth: 5,
      points: this.data
    })
  }
  
  _createReglContextOnCanvas(){
    let context = this.canvas.getContext("webgl"); 
    return new ReGL(context);
  }
  
  _initializeData() {
    this.data.forEach(individual => {
      individual.drawing = {
        "x": getRandomInteger(0, this._getCanvasSize().width),
        "y": getRandomInteger(0, this._getCanvasSize().height),
        "color": {
          "r": 100,
          "g": 100,
          "b": 255,
          "opacity":1
        },
        "size": 5
      }
    })
  }
  
  _initializeAxes() {
    this.groupingInformation.axesGroups.x.attr(
      'transform', 
      `translate(${this.canvasMargin.left}, ${this._getCanvasSize().height + this.canvasMargin.top})`
    )
    this.groupingInformation.axesGroups.y.attr(
      'transform', 
      `translate(${this.canvasMargin.left}, ${this.canvasMargin.top})`
    )
    this.groupingInformation.scales.x.range([0, this._getCanvasSize().width])
    this.groupingInformation.scales.y.range([0, this._getCanvasSize().height]) 
  }
  
  _resetAxes() {
    Object.keys(this.groupingInformation.axesGroups).forEach(axisName => {
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
    })
  }
  
  _handleGroupAction(action) {
    if(action.attribute === "amount") {
      this._handleGroupingActionAmount(action)
    } else {
      this._handleGroupingActionAttribute(action)
    }
    
    this.groupingInformation.attributes[action.axis] = action.attribute
  }
  
  _handleGroupingActionAmount(action) {
    let axis = action.axis
    let otherAxis = axis === "x" ? "y" : "x"
    
    if (this.groupingInformation.attributes[otherAxis] === "amount" || this.groupingInformation.attributes[otherAxis] === "") {
      lively.notify("you cannot get an amount of amounts or randomness")
      return
    }
    
    let values = DataProcessor.getValuesForAttribute(action.attribute)
    let amountsByValues = {}
    values.forEach(value => {
      amountsByValues[value] = 0
    })
    this.data.forEach(individual => {
      amountsByValues[individual[action.attribute]] += 1
    })
  }
  
  _handleGroupingActionAttribute(action) {
    let groupingAttribute = action.attribute
    let values = DataProcessor.getValuesForAttribute(groupingAttribute)
    
    let axisName = action.axis
    
    this.groupingInformation.scales[axisName].domain(axisName === "x" ? values : values.reverse())
    
    let scale = this.groupingInformation.scales[axisName]
    let bandwidth = this.groupingInformation.scales[axisName].bandwidth()
    
    this.data.forEach(individual => {
      individual.drawing[axisName] = scale(individual[groupingAttribute]) + getRandomInteger(0, bandwidth)
    })
    
    let axis
    if (axisName === "x") {
      axis = d3.axisBottom(scale)
    } else {
      axis = d3.axisLeft(scale)
    }
    
    this.groupingInformation.axesGroups[axisName].call(axis)
  }
       
  _handleColorAction(action) {
    let colorAttribute = action.attribute
    
    this.data.forEach(individual => {
      let uniqueValue = DataProcessor.getUniqueValueFromIndividual(individual, colorAttribute)
      let colorString = ColorStore.getColorForValue(colorAttribute, uniqueValue);
      individual.drawing.color = ColorStore.convertRGBStringToReglColorObject(colorString);
    })
  }
        
  _handleFilterAction(action) {
    let filterAttribute = action.attribute
    let filterValues = action.values
    
    this.data = deepCopy(this.originalData)
    
    let filteredData = this.data.filter(individual => {
      return filterValues.includes(individual[filterAttribute])
    })
    
    this.data = filteredData
  }
        
  _handleSelectAction(action) {
    
  }
        
  _handleNotSupportedAction(action) {
    
  }
  
  _getCanvasSize() {
    return this.canvas.getBoundingClientRect()
  }
}