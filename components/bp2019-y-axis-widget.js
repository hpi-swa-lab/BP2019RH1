"enable aexpr";

import d3 from 'src/external/d3.v5.js'

import Morph from 'src/components/widgets/lively-morph.js';
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
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
    
    this.xAxisGroup = d3.select(this.get("#x-axis-group"))
                        .attr('transform', `translate(${this.canvasMargin.left}, ${this.canvas.getBoundingClientRect().height + this.canvasMargin.top})`)
    this.xScale = d3.scaleBand()
                   .range([0, this.canvas.getBoundingClientRect().width])
                   .padding(0.2)
    
    this.yAxisGroup = d3.select(this.get("#y-axis-group"))
                        .attr('transform', `translate(${this.canvasMargin.left}, ${this.canvasMargin.top})`)
    this.yScale = d3.scaleBand()
                   .range([0, this.canvas.getBoundingClientRect().height])
                   .padding(0.2)
        
    this.controlWidget = this.get("#control-widget")
    this.controlWidget.addListener(this)
    this.controlWidget.initializeAfterDataFetch()
    
    this.groupingAttributes = {
      "x": "",
      "y": ""
    }
    
    this._draw()
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setData(data) {
    this.data = data
    this._initializeData()
    this.originalData = deepCopy(this.data)
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
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
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
      default:
        this._handleNotSupportedAction(action);
    }
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
        "x": getRandomInteger(0, this.canvas.getBoundingClientRect().width),
        "y": getRandomInteger(0, this.canvas.getBoundingClientRect().height),
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
  
  _handleGroupAction(action) {
    if(action.attribute === "amount") {
      this.__handleGroupingActionAmount(action)
    } else {
      this.__handleGroupingActionAttribute(action)
    }
    
    this.groupingAttributes[action.axis] = action.attribute
    
    this._draw()
  }
  
  _handleGroupingActionAmount(action) {
    let axis = action.axis
    let otherAxis = axis === "x" ? "y" : "x"
    
    if (this.groupingAttributes[otherAxis] === "amount" || this.groupingAttributes[otherAxis] === "") {
      lively.notify("you cannot get amount of amounts or randomness")
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
    
    if (axisName === "x") {
      this.xScale.domain(values)

      this.data.forEach(individual => {
        individual.drawing["x"] = this.xScale(individual[groupingAttribute]) + getRandomInteger(0, this.xScale.bandwidth())
      })

      let axis = d3.axisBottom(this.xScale)
      this.xAxisGroup.call(axis)
    } else if (axisName === "y") {
      this.yScale.domain(values.reverse())

      this.data.forEach(individual => {
        individual.drawing["y"] = this.yScale(individual[groupingAttribute]) + getRandomInteger(0, this.yScale.bandwidth())
      })

      let axis = d3.axisLeft(this.yScale)
      this.yAxisGroup.call(axis)
    }
  }
       
  _handleColorAction(action) {
    let colorAttribute = action.attribute
    
    this.data.forEach(individual => {
      let uniqueValue = DataProcessor.getUniqueValueFromIndividual(individual, colorAttribute)
      let colorString = ColorStore.getColorForValue(colorAttribute, uniqueValue);
      individual.drawing.color = ColorStore.convertRGBStringToReglColorObject(colorString);
    })
    
    this._draw()
  }
        
  _handleSelectAction(action) {
    
  }
        
  _handleFilterAction(action) {
    let filterAttribute = action.attribute
    let filterValues = action.values
    
    this.data = deepCopy(this.originalData)
    
    let filteredData = this.data.filter(individual => {
      return filterValues.includes(individual[filterAttribute])
    })
    
    this.data = filteredData
    
    this._draw()
  }
        
  _handleNotSupportedAction(action) {
    
  }
}