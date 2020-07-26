// needed to be able to call functions called with event listener with the context of FreehandDrawer and not the context of the element to which the event listener is bound
var boundDraw;
var boundSetPosition;
var boundOnDrawStop;

import d3 from 'src/external/d3.v5.js'
import ContextMenu from 'src/client/contextmenu.js'


import inside from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/npm-point-in-polygon.js" //absolute path needed, don't ask why

import FreehandSelection from './freehandSelection.js'
import ColorStore from './color-store.js'
import { deepCopy } from './utils.js'

export default class FreehandDrawer {
  constructor(parentElement, canvas, svg, style = {}) {
    
    // parentElement should be a div containing the canvas (on some level)
    // canvas should lay on top of svg, canvas and svg should always have same extent
    
    this.parentElement = parentElement
    this.canvas = canvas
    this.svg = svg
    
    this.pos = { x: 0, y: 0 }
    this.transform = {x: 0 , y: 0, k: 1}
    this.colorstore = new ColorStore()
    
    this._initializeContext(canvas, style)
  
    this.lastLinePoints = []
    this.selections = []

    this.listeners = []

    this._registerEventListeners()
    boundDraw = this._draw.bind(this)
    boundSetPosition = this._setPosition.bind(this)
    boundOnDrawStop = this._onDrawStop.bind(this)
  }

  start() {
    this.canvas.addEventListener('mousemove', boundDraw, {capture: true})
    this.canvas.addEventListener('mousedown', boundSetPosition, {capture: true})
    this.canvas.addEventListener('mouseup', boundOnDrawStop, {capture: true})
  }

  stop() {
    this.canvas.removeEventListener('mousemove', boundDraw)
    this.canvas.removeEventListener('mousedown', boundSetPosition)
    this.canvas.removeEventListener('mouseup', boundOnDrawStop)
  }
 
  addListener(listener) {
    this.listeners.push(listener)
  }
  
  drawSelections() {
    let leftPadding = this.canvas.style.paddingLeft ? parseInt(this.canvas.style.paddingLeft) : 0
    let topPadding = this.canvas.style.paddingTop ? parseInt(this.canvas.style.paddingTop) : 0
    
    let selections = this.selections
    d3.select(this.svg).selectAll("polygon")
      .filter(function (d){ return !selections.some(selection => selection.color === d.color)})
      .remove()
    
    d3.select(this.svg).selectAll("polygon")
      .data(this.selections)
      .enter()
      .append("polygon")
      .attr("points",function(d) { 
            return d.linePoints.map(function(d) {
                return [d.x + leftPadding, d.y + topPadding].join(",");
            }).join(" ");
          })
      .style("fill", function(d) {return d.color})
      .style("fill-opacity", "0.3")
      .style("stroke", "black")
      .style("stroke-dasharray", "5,5")
  }
  
  applyScaling(factor) {
    this.selections.forEach(selection => {
      selection.linePoints = selection.linePoints.map(point => {
        return {"x": point.x * factor.x, "y": point.y * factor.y}
      })  
    })
    this.drawSelections()
  }
  
  applyTransform(transform) {
    this.transform = transform
    d3.select(this.svg).selectAll("polygon")
      .attr("transform", transform)
  }
  
  updateStyle(style) {
    this.ctx.lineWidth = style.lineWidth ? style.lineWidth : this.ctx.lineWidth
    this.ctx.lineCap = style.lineCap ? style.lineCap : this.ctx.lineCap
    this.ctx.strokeStyle = style.strokeStyle ? style.strokeStyle : this.ctx.strokeStyle
  }
  
  deleteSelections() {
    this.selections.forEach(selection => {
      this._deleteSelection(selection)
    })
  }
  
  _onDrawStop() {
    this.lastLinePoints.push({ "x": this.pos.x, "y": this.pos.y })
    
    let newFreehandSelection = new FreehandSelection(this.colorstore.generateRandomHexColor(), deepCopy(this.lastLinePoints))
    this.selections.push(newFreehandSelection)

    this.listeners.forEach(listener => {
      listener.freehandSelectionCreated()
    })
    
    this.lastLinePoints = []
  }

  _setPosition(e) {
    let position = this._calculateRelativePosition(e) 
        
    this.pos.x = position.x;
    this.pos.y = position.y;
  }
  
  _calculateRelativePosition(e) {
    var rect = e.target.getBoundingClientRect()
    let paddingLeft = this.canvas.style.paddingLeft ? parseInt(this.canvas.style.paddingLeft) : 0
    let paddingTop = this.canvas.style.paddingTop ? parseInt(this.canvas.style.paddingTop) : 0
    var x = e.clientX - rect.left - paddingLeft
    var y = e.clientY - rect.top - paddingTop
    
    // apply tranformation
    x = (x - this.transform.x) / this.transform.k
    y = (y - this.transform.y) / this.transform.k
    
    return lively.pt(x,y)
  }
  

  _draw(e) {
    // mouse left button and shiftKey must be pressed
    if (e.buttons !== 1) return
    if (!e.shiftKey) return
    
    this.ctx.save()
    this.ctx.translate(this.transform.x, this.transform.y)
    this.ctx.scale(this.transform.k, this.transform.k)
    
    this.ctx.beginPath() // begin

    this.ctx.moveTo(this.pos.x, this.pos.y) // from

    this.lastLinePoints.push({ "x": this.pos.x, "y": this.pos.y })

    this._setPosition(e)
    this.ctx.lineTo(this.pos.x, this.pos.y) // to

    this.ctx.stroke() // draw it!
    this.ctx.restore()
  }

  _clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  _initializeContext(canvas, style) {
    this.ctx = canvas.getContext('2d')
    this.ctx.lineWidth = style.lineWidth ? style.lineWidth : 1
    this.ctx.lineCap = style.lineCap ? style.lineCap : 'round'
    this.ctx.strokeStyle = style.strokeStyle ? style.strokeStyle : "#000000"
  }
  
  _deleteSelection(selection) {
    if (this.selections.includes(selection) ) {
      this.selections.splice(this.selections.indexOf(selection), 1)
    }
    this.listeners.forEach(listener => listener.freehandSelectionDeleted(selection))
  }
  
  _registerEventListeners() {
    this.canvas.addEventListener("contextmenu", (evt) => {
      let currentSelection = this._findSelectionFromPosition(evt)
      if (currentSelection) {
        evt.stopPropagation()
        evt.preventDefault()
        let selectionSVG = this._getSVGElementFromSelection(currentSelection)
        this._openSelectionMenu(evt, currentSelection, selectionSVG)
      }
    })
  }
  
  _findSelectionFromPosition(evt) {
    let result = false
    let position = this._calculateRelativePosition(evt)
    this.selections.forEach(selection => {
      let linePointsArray = selection.linePoints.map(point => [point.x, point.y])
      if (inside([position.x, position.y], linePointsArray)) {
        result = selection
      } 
    })
    return result
  }
  
  _getSVGElementFromSelection(selection) {
    var d3Selection = d3.select(this.svg).selectAll("polygon").filter(function(svg) {
      return svg.color === selection.color;
    })
    
    // happily assuming that we always have just one corresponding selectionElement 
    // (which given the usage of color as a kinda identifier should be fine)
    if (d3Selection._groups.length >= 1) return d3Selection._groups[0][0] 
  }
  
  async _openSelectionMenu(evt, selection, selectionSVG) {
    const menuItems = [
      ['Create new visualization from selection', () => {
        this.listeners.forEach(listener => listener.freehandSelectionOnContextMenu(evt, selection, selectionSVG))
      }],
      ['Delete selection', () => this._deleteSelection(selection)]
    ]
    const menu = await ContextMenu.openIn(document.body, evt, this.canvas, document.body,  menuItems)
  }
}