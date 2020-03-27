//import {Zoomer} from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/map/zoomer.js"
import d3 from "src/external/d3.v5.js"

class Canvas {
  
  constructor(world, canvas, individuals) {
    this.canvas = canvas
    this.transform = null
    this.scale = 1
    this.individuals = individuals
    this.world = world
    this.pointSize = 2
    this.context = canvas.getContext("2d")
  }
  
  updateScale(scale) {
    this.scale = scale
  }
  
  updateTransform(transform) {
    this.transform = transform
  }
  
  updatePointSize() {
    this.pointSize = this.pointSize / this.scale
  }
  
  drawIndividuals() {
    this.individuals.forEach((individual) => {
      this.drawPixel(individual)
    })
  }
  
  drawPixel(individual) {
    let color = this.getColor(individual)
    let r = color.r
    let g = color.g
    let b = color.b
    let a = color.a
    let x = individual.drawing.position.x
    let y = individual.drawing.position.y
    
    this.context.fillStyle = "rgba("+ r +","+ g +","+ b +","+ a +")"
    this.context.fillRect(x, y, this.pointSize, this.pointSize)
  }
  
  registerZoom() {
  //  this.zoomer = new Zoomer(this);
  }
  
}

export class DefaultColoredCanvas extends Canvas {
  
  getColor(individual) {
    return individual.drawing.defaultColor
  }
  
}

export class UniqueColoredCanvas extends Canvas {
  
  getColor(individual) {
    return individual.drawing.uniqueColor
  }
  
}